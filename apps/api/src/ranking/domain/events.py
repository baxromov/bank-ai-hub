from dataclasses import dataclass
from src.event_bus.events import DomainEvent


@dataclass(frozen=True)
class RankChanged(DomainEvent):
    user_id: str = ""
    category: str = ""
    old_rank: int = 0
    new_rank: int = 0
    week_number: int = 0
    year: int = 0


@dataclass(frozen=True)
class BadgeEarned(DomainEvent):
    user_id: str = ""
    badge_id: str = ""
    badge_name: str = ""
