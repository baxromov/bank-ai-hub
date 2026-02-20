from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class CoinBalance:
    user_id: str
    balance: int = 0
    total_earned: int = 0
    total_spent: int = 0
    updated_at: datetime | None = None

    def can_spend(self, amount: int) -> bool:
        return self.balance >= amount


@dataclass
class CoinTransaction:
    id: str
    user_id: str
    action_type: str
    amount: int
    status: str
    description: str = ""
    metadata: dict = field(default_factory=dict)
    quality_score: float | None = None
    reviewed_by: str | None = None
    created_at: datetime | None = None


@dataclass
class CoinRule:
    id: str
    action_type: str
    min_amount: int
    max_amount: int
    auto_approve: bool = True
    is_active: bool = True
