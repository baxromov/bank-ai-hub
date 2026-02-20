from datetime import datetime
from pydantic import BaseModel, Field


class CreateSessionRequest(BaseModel):
    title: str = "New Chat"
    model: str = "qwen2.5:7b"
    agent_mode: str = "simple_chat"


class SessionResponse(BaseModel):
    id: str
    title: str
    model: str
    agent_mode: str
    is_active: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None


class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=15000)


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    token_count: int = 0
    latency_ms: int = 0
    tool_calls: list[dict] = []
    created_at: datetime | None = None


class StreamRequest(BaseModel):
    session_id: str
    content: str = Field(..., min_length=1, max_length=15000)
    model: str = "qwen2.5:7b"
