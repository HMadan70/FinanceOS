from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=20)
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    created_at: datetime

    has_completed_onboarding: bool
    goal: Optional[str] = None
    income_range: Optional[str] = None
    money_challenge: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class TransactionCreate(BaseModel):
    amount: float
    description: Optional[str] = None
    category: Optional[str] = None


class TransactionResponse(BaseModel):
    id: int
    amount: float
    description: Optional[str] = None
    category: Optional[str] = None
    date: datetime

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=30)


class CategoryResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


INCOME_RANGE_PRESETS = ("under_50", "under_100", "under_500", "under_1000")


class OnboardingRequest(BaseModel):
    goal: Literal["save_money", "stick_to_budget", "track_spending"]

    income_range: str = Field(min_length=1, max_length=50)

    money_challenge: Literal["overspending", "not_saving", "no_visibility"]

    @field_validator("income_range")
    @classmethod
    def validate_income_range(cls, value: str) -> str:
        cleaned = value.strip()

        if cleaned in INCOME_RANGE_PRESETS:
            return cleaned

        if not cleaned:
            raise ValueError("income_range cannot be empty")

        return cleaned


class MonthOut(BaseModel):
    id: int
    start_date: date
    starting_balance: float

    # These three aren't columns on Month — they're computed from the
    # month's transactions every time it's read. Keeping them out of the
    # database means they're never stale.
    balance: float
    money_in: float
    money_out: float

    leftover_choice_made: bool

    class Config:
        from_attributes = True


class MonthCreate(BaseModel):
    starting_balance: float


class LeftoverChoice(BaseModel):
    # A plain 3-option Literal, same pattern as OnboardingRequest above:
    # anything else is rejected with a 422 before the endpoint even runs.
    choice: Literal["savings", "add_to_balance", "discard"]


class MonthCurrentResponse(BaseModel):
    # GET /months/current can mean three different things, so `status` tells
    # the frontend which of the fields below to expect populated.
    status: Literal["exists", "needs_leftover_choice", "needs_starting_balance"]

    # Populated only when status == "exists".
    month: Optional[MonthOut] = None

    # Populated only when status == "needs_leftover_choice". leftover_month_id
    # is what the frontend sends to POST /months/{id}/leftover-choice.
    leftover_month_id: Optional[int] = None
    leftover_amount: Optional[float] = None