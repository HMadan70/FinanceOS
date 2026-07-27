from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/months", tags=["months"])


def _is_current_calendar_month(month: models.Month) -> bool:
    # start_date is always the 1st of its month (see create_month below), so
    # comparing year+month is enough — no need to worry about day-of-month.
    today = date.today()
    return month.start_date.year == today.year and month.start_date.month == today.month


def _latest_month(db: Session, user_id: int) -> models.Month | None:
    # Months are only ever created one at a time, in order (create_month
    # blocks creating a new one until the current one exists), so the most
    # recent row is either this calendar month's Month, or the previous one.
    return (
        db.query(models.Month)
        .filter(models.Month.user_id == user_id)
        .order_by(models.Month.start_date.desc())
        .first()
    )


def _transactions_sum(db: Session, month_id: int) -> float:
    # SUM() over zero rows returns SQL NULL, not 0 — coalesce turns that into
    # 0.0 so callers never have to special-case "no transactions yet".
    return (
        db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0))
        .filter(models.Transaction.month_id == month_id)
        .scalar()
    )


def _money_in_out(db: Session, month_id: int) -> tuple[float, float]:
    # No income/expense type field exists on Transaction — amount is signed
    # instead (this is also why balance = starting_balance + SUM(amount)
    # works at all: a negative expense subtracts itself automatically).
    # So "money in" is the total of positive amounts, and "money out" is the
    # total of negative amounts, sign-flipped so it reads as a plain
    # positive "amount spent" figure instead of a negative one.
    money_in = (
        db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0))
        .filter(models.Transaction.month_id == month_id, models.Transaction.amount > 0)
        .scalar()
    )
    money_out_signed = (
        db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0))
        .filter(models.Transaction.month_id == month_id, models.Transaction.amount < 0)
        .scalar()
    )
    # `+ 0.0` turns a -0.0 result (from negating a sum of zero) back into a
    # plain 0.0 — cosmetic, but -0.0 in a JSON response reads as a bug.
    return money_in, -money_out_signed + 0.0


def _build_month_out(db: Session, month: models.Month) -> schemas.MonthOut:
    money_in, money_out = _money_in_out(db, month.id)
    return schemas.MonthOut(
        id=month.id,
        start_date=month.start_date,
        starting_balance=month.starting_balance,
        balance=month.starting_balance + _transactions_sum(db, month.id),
        money_in=money_in,
        money_out=money_out,
        leftover_choice_made=month.leftover_choice_made,
    )


def _pending_leftover(db: Session, previous_month: models.Month | None) -> float | None:
    # Returns the leftover amount if the user still needs to make the 3-way
    # choice about it, or None if there's nothing to resolve — either there's
    # no previous month, the leftover was exactly zero, or a choice was
    # already made for it.
    if previous_month is None or previous_month.leftover_choice_made:
        return None

    leftover = previous_month.starting_balance + _transactions_sum(db, previous_month.id)
    return leftover if leftover != 0 else None


@router.get("/current", response_model=schemas.MonthCurrentResponse)
def get_current_month(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    latest = _latest_month(db, current_user.id)

    if latest is not None and _is_current_calendar_month(latest):
        return schemas.MonthCurrentResponse(status="exists", month=_build_month_out(db, latest))

    leftover = _pending_leftover(db, latest)
    if leftover is not None:
        return schemas.MonthCurrentResponse(
            status="needs_leftover_choice",
            leftover_month_id=latest.id,
            leftover_amount=leftover,
        )

    return schemas.MonthCurrentResponse(status="needs_starting_balance")


@router.post("", response_model=schemas.MonthOut)
def create_month(
    payload: schemas.MonthCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    latest = _latest_month(db, current_user.id)

    if latest is not None and _is_current_calendar_month(latest):
        raise HTTPException(status_code=400, detail="A month already exists for the current calendar month")

    if _pending_leftover(db, latest) is not None:
        raise HTTPException(
            status_code=400,
            detail="Resolve the previous month's leftover before starting a new one",
        )

    # If the user chose "add_to_balance" last time, the leftover is sitting
    # on the previous month's carry_over_amount — fold it in here, once, at
    # creation time. It can never be applied twice: this Month row is only
    # ever "the previous month" for a single POST /months call.
    carry_over = latest.carry_over_amount if latest is not None and latest.carry_over_amount else 0.0

    new_month = models.Month(
        user_id=current_user.id,
        start_date=date.today().replace(day=1),
        starting_balance=payload.starting_balance + carry_over,
        leftover_choice_made=False,
    )
    db.add(new_month)
    db.commit()
    db.refresh(new_month)

    return _build_month_out(db, new_month)


@router.post("/{month_id}/leftover-choice", response_model=schemas.MonthOut)
def choose_leftover(
    month_id: int,
    payload: schemas.LeftoverChoice,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    month = (
        db.query(models.Month)
        .filter(models.Month.id == month_id, models.Month.user_id == current_user.id)
        .first()
    )
    if not month:
        raise HTTPException(status_code=404, detail="Month not found")

    if _is_current_calendar_month(month):
        raise HTTPException(status_code=400, detail="Leftover choice only applies to a past month")

    # Without this guard, choosing "add_to_balance" twice (or switching to
    # "discard" after already choosing "add_to_balance") could silently
    # change what a future POST /months adds — so once made, a choice sticks.
    if month.leftover_choice_made:
        raise HTTPException(status_code=400, detail="A leftover choice was already made for this month")

    leftover = month.starting_balance + _transactions_sum(db, month.id)

    if payload.choice == "savings":
        # TODO(Phase 3): once a SavingsBalance model exists, credit `leftover`
        # to it here instead of just marking the choice made.
        pass
    elif payload.choice == "add_to_balance":
        month.carry_over_amount = leftover
    # "discard" needs no action beyond leftover_choice_made below.

    month.leftover_choice_made = True
    db.commit()
    db.refresh(month)

    return _build_month_out(db, month)
