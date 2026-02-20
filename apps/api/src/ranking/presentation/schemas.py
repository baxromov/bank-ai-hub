from pydantic import BaseModel


class RankingEntryResponse(BaseModel):
    user_id: str
    category: str
    score: float
    rank: int
    week_number: int
    year: int


class BadgeResponse(BaseModel):
    id: str
    name: str
    name_ru: str
    description: str
    icon_url: str
    category: str


class UserBadgeResponse(BaseModel):
    badge_id: str
    badge_name: str | None = None
    earned_at: str | None = None


class HighlightsResponse(BaseModel):
    week_number: int
    year: int
    categories: dict
