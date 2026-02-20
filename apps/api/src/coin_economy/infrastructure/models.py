from datetime import datetime

from sqlalchemy import String, Integer, Float, Boolean, DateTime, JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from src.database.base import Base, TimestampMixin, UUIDMixin


class CoinBalanceModel(Base, TimestampMixin):
    __tablename__ = "coin_balances"

    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id"), primary_key=True
    )
    balance: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_earned: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_spent: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class CoinTransactionModel(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "coin_transactions"

    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id"), nullable=False, index=True
    )
    action_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    description: Mapped[str] = mapped_column(String(500), default="")
    extra_data: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    quality_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    reviewed_by: Mapped[str | None] = mapped_column(
        String, ForeignKey("users.id"), nullable=True
    )


class CoinRuleModel(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "coin_rules"

    action_type: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    min_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    max_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    auto_approve: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
