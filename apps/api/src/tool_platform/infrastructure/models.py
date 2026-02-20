from datetime import datetime

from sqlalchemy import String, Integer, Float, Text, Boolean, DateTime, JSON, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from src.database.base import Base, TimestampMixin, UUIDMixin


class McpToolModel(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "mcp_tools"

    author_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    department: Mapped[str | None] = mapped_column(String(30), nullable=True)
    manifest: Mapped[dict] = mapped_column(JSON, default=dict)
    version: Mapped[str] = mapped_column(String(20), default="1.0.0")
    mcp_transport: Mapped[str] = mapped_column(String(20), default="http_sse")
    container_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft", index=True)
    coin_price: Mapped[int | None] = mapped_column(Integer, nullable=True)
    coin_reward: Mapped[int | None] = mapped_column(Integer, nullable=True)
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    average_rating: Mapped[float] = mapped_column(Float, default=0.0)
    quality_score: Mapped[float] = mapped_column(Float, default=0.0)
    prompt_template: Mapped[str] = mapped_column(Text, default="")


class ToolVersionModel(Base, UUIDMixin):
    __tablename__ = "tool_versions"

    tool_id: Mapped[str] = mapped_column(
        String, ForeignKey("mcp_tools.id"), nullable=False, index=True
    )
    version: Mapped[str] = mapped_column(String(20), nullable=False)
    changelog: Mapped[str] = mapped_column(Text, default="")
    manifest: Mapped[dict] = mapped_column(JSON, default=dict)
    prompt_template: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class ToolPermissionModel(Base, UUIDMixin):
    __tablename__ = "tool_permissions"
    __table_args__ = (
        UniqueConstraint("user_id", "tool_id", name="uq_tool_permission"),
    )

    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id"), nullable=False, index=True
    )
    tool_id: Mapped[str] = mapped_column(
        String, ForeignKey("mcp_tools.id"), nullable=False
    )
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
