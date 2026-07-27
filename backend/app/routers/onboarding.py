from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post("", response_model=schemas.UserResponse)
def complete_onboarding(
    answers: schemas.OnboardingRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    current_user.goal = answers.goal
    current_user.income_range = answers.income_range
    current_user.money_challenge = answers.money_challenge

    current_user.has_completed_onboarding = True

    db.commit()
    db.refresh(current_user)

    return current_user
