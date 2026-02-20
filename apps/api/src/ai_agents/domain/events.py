from dataclasses import dataclass
from src.event_bus.events import DomainEvent


@dataclass(frozen=True)
class ToolInvoked(DomainEvent):
    user_id: str = ""
    tool_name: str = ""
    session_id: str = ""


@dataclass(frozen=True)
class QualityEvaluated(DomainEvent):
    user_id: str = ""
    session_id: str = ""
    quality_score: float = 0.0
    coin_amount: int = 0


@dataclass(frozen=True)
class ApprovalRequested(DomainEvent):
    thread_id: str = ""
    type: str = ""
    user_id: str = ""
    details: str = ""
