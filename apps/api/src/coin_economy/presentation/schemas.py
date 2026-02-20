from datetime import datetime
from pydantic import BaseModel, Field


class BalanceResponse(BaseModel):
    balance: int
    total_earned: int
    total_spent: int


class TransactionResponse(BaseModel):
    id: str
    action_type: str
    amount: int
    status: str
    description: str
    quality_score: float | None = None
    created_at: datetime | None = None


class EarnRequest(BaseModel):
    action_type: str
    description: str = ""
    quality_score: float | None = Field(None, ge=0.0, le=1.0)


class AdminAwardRequest(BaseModel):
    user_id: str
    amount: int = Field(..., gt=0)
    description: str = ""


class ApproveRequest(BaseModel):
    action: str = Field(..., pattern="^(approve|reject)$")


class RuleResponse(BaseModel):
    id: str
    action_type: str
    min_amount: int
    max_amount: int
    auto_approve: bool
    is_active: bool
