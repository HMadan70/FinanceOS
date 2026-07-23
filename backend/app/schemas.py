from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

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