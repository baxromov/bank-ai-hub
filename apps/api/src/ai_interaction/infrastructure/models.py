from datetime import datetime

from sqlalchemy import String, Integer, Boolean, Text, DateTime, JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from src.database.base import Base, TimestampMixin, UUIDMixin


class ChatSessionModel(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "chat_sessions"

    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), default="New Chat")
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    agent_mode: Mapped[str] = mapped_column(String(20), default="simple_chat")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class ChatMessageModel(Base, UUIDMixin):
    __tablename__ = "chat_messages"

    session_id: Mapped[str] = mapped_column(
        String, ForeignKey("chat_sessions.id"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    tool_calls: Mapped[dict] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
