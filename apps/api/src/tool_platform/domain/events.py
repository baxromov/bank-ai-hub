from dataclasses import dataclass
from src.event_bus.events import DomainEvent


@dataclass(frozen=True)
class ToolPublished(DomainEvent):
    tool_id: str = ""
    tool_name: str = ""
    author_id: str = ""


@dataclass(frozen=True)
class ToolInvoked(DomainEvent):
    tool_id: str = ""
    user_id: str = ""
    tool_name: str = ""
