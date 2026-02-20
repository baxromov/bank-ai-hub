from dataclasses import dataclass
from datetime import datetime


@dataclass
class RankingEntry:
    id: str
    user_id: str
    category: str
    week_number: int
    year: int
    score: float
    rank: int
    created_at: datetime | None = None


@dataclass
class Badge:
    id: str
    name: str
    name_ru: str
    description: str
    icon_url: str
    category: str
    threshold: int


@dataclass
class UserBadge:
    id: str
    user_id: str
    badge_id: str
    badge: Badge | None = None
    earned_at: datetime | None = None
