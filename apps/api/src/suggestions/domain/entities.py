from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class SuggestionStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    IMPLEMENTED = "implemented"


@dataclass
class Suggestion:
    id: str
    user_id: str
    title: str
    description: str
    department: str
    impact: str = ""
    status: str = "submitted"
    coin_reward: int = 0
    quality_score: float | None = None
    reviewed_by: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
