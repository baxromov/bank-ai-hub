from dataclasses import dataclass
from src.event_bus.events import DomainEvent


@dataclass(frozen=True)
class PromptSent(DomainEvent):
    user_id: str = ""
    session_id: str = ""
    prompt_length: int = 0
    model: str = ""


@dataclass(frozen=True)
class ResponseGenerated(DomainEvent):
    user_id: str = ""
    session_id: str = ""
    token_count: int = 0
    latency_ms: int = 0
