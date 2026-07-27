from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key= True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    has_completed_onboarding = Column(Boolean, default=False, nullable=False)

    goal = Column(String, nullable=True)
    income_range = Column(String, nullable=True)
    money_challenge = Column(String, nullable=True)

    transactions = relationship("Transaction", back_populates="owner", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="owner", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, nullable=True)
    date = Column(DateTime(timezone=True), server_default=func.now())

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="transactions")

    # nullable=True on purpose: transactions created before Monthly Cycles
    # existed have no month to belong to, and shouldn't be forced into one.
    month_id = Column(Integer, ForeignKey("months.id"), nullable=True)


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="categories")


class Month(Base):
    __tablename__ = "months"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(Date, nullable=False) 
    starting_balance = Column(Float, nullable=False)
    leftover_choice_made = Column(Boolean, default=False, nullable=False)

    # Set only when the user picks "add_to_balance" for this month's leftover.
    # The next POST /months reads it off the previous month and folds it into
    # the new starting_balance. See routers/months.py for the full reasoning.
    carry_over_amount = Column(Float, nullable=True)