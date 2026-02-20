from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class ChatSession:
    id: str
    user_id: str
    title: str
    model: str
    agent_mode: str = "simple_chat"
    is_active: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None


@dataclass
class ChatMessage:
    id: str
    session_id: str
    role: str
    content: str
    token_count: int = 0
    latency_ms: int = 0
    tool_calls: list[dict] = field(default_factory=list)
    created_at: datetime | None = None
