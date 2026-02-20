from dataclasses import dataclass
from src.event_bus.events import DomainEvent


@dataclass(frozen=True)
class ItemPurchased(DomainEvent):
    user_id: str = ""
    item_id: str = ""
    item_name: str = ""
    coins_cost: int = 0


@dataclass(frozen=True)
class PurchaseFulfilled(DomainEvent):
    user_id: str = ""
    purchase_id: str = ""
    item_name: str = ""
