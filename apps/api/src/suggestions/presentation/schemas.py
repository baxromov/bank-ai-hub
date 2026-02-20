from datetime import datetime
from pydantic import BaseModel, Field


class SubmitSuggestionRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=300)
    description: str = Field(..., min_length=10)
    department: str
    impact: str = ""


class SuggestionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    department: str
    impact: str
    status: str
    coin_reward: int
    quality_score: float | None = None
    created_at: datetime | None = None


class ApproveSuggestionRequest(BaseModel):
    coin_reward: int = Field(0, ge=0)
