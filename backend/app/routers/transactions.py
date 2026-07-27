from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas, auth
# Reusing months.py's own lookup helpers (rather than re-writing the "is this
# month's row actually THIS calendar month" check here) so the two endpoints
# can never quietly disagree about what "the current month" means.
from app.routers.months import _latest_month, _is_current_calendar_month

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/", response_model=schemas.TransactionResponse)
def create_transaction(
    transaction: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # If the user has a Month for this calendar month, stamp it on the new
    # transaction. If not — they haven't entered a starting balance yet, or
    # it's simply not wired up on the frontend yet — month_id is left null
    # rather than blocking creation. Transaction.month_id is nullable exactly
    # for cases like this; failing to create a transaction over a month that
    # doesn't exist yet would break the core "add a transaction" flow for
    # every user, since nobody has ever had a Month until this feature ships.
    current_month = _latest_month(db, current_user.id)
    if current_month is not None and not _is_current_calendar_month(current_month):
        current_month = None

    new_transaction = models.Transaction(
        amount=transaction.amount,
        description=transaction.description,
        category=transaction.category,
        owner_id=current_user.id,
        month_id=current_month.id if current_month else None,
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return new_transaction


@router.get("/", response_model=List[schemas.TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Transaction).filter(models.Transaction.owner_id == current_user.id).all()


@router.get("/{transaction_id}", response_model=schemas.TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.owner_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    return transaction


@router.put("/{transaction_id}", response_model=schemas.TransactionResponse)
def update_transaction(
    transaction_id: int,
    updated: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.owner_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    transaction.amount = updated.amount
    transaction.description = updated.description
    transaction.category = updated.category

    db.commit()
    db.refresh(transaction)
    return transaction


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.owner_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    db.delete(transaction)
    db.commit()
    return {"detail": "Transaction deleted"}