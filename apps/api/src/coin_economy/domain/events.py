from dataclasses import dataclass
from src.event_bus.events import DomainEvent


@dataclass(frozen=True)
class CoinsEarned(DomainEvent):
    user_id: str = ""
    amount: int = 0
    action_type: str = ""
    new_balance: int = 0


@dataclass(frozen=True)
class CoinsSpent(DomainEvent):
    user_id: str = ""
    amount: int = 0
    action_type: str = ""
    new_balance: int = 0


@dataclass(frozen=True)
class TransactionApproved(DomainEvent):
    user_id: str = ""
    transaction_id: str = ""
    amount: int = 0
    new_balance: int = 0
