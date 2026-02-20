from datetime import datetime

from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database.base import Base, TimestampMixin, UUIDMixin


class RankingEntryModel(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ranking_entries"
    __table_args__ = (
        UniqueConstraint("user_id", "category", "week_number", "year", name="uq_ranking_user_week"),
    )

    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    week_number: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    rank: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class BadgeModel(Base, UUIDMixin):
    __tablename__ = "badges"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name_ru: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    icon_url: Mapped[str] = mapped_column(String(500), default="")
    category: Mapped[str] = mapped_column(String(30), nullable=False)
    threshold: Mapped[int] = mapped_column(Integer, nullable=False)


class UserBadgeModel(Base, UUIDMixin):
    __tablename__ = "user_badges"
    __table_args__ = (
        UniqueConstraint("user_id", "badge_id", name="uq_user_badge"),
    )

    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    badge_id: Mapped[str] = mapped_column(String, ForeignKey("badges.id"), nullable=False)
    earned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
