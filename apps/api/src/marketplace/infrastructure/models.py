from datetime import datetime

from sqlalchemy import String, Integer, Boolean, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from src.database.base import Base, TimestampMixin, UUIDMixin


class MarketplaceItemModel(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "marketplace_items"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    name_ru: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), default="")
    stock: Mapped[int | None] = mapped_column(Integer, nullable=True)
    linked_tool_id: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class PurchaseModel(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "purchases"

    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id"), nullable=False, index=True
    )
    item_id: Mapped[str] = mapped_column(
        String, ForeignKey("marketplace_items.id"), nullable=False
    )
    coins_cost: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    fulfilled_by: Mapped[str | None] = mapped_column(
        String, ForeignKey("users.id"), nullable=True
    )
