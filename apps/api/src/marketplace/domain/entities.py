from dataclasses import dataclass
from datetime import datetime


@dataclass
class MarketplaceItem:
    id: str
    name: str
    name_ru: str
    description: str
    category: str
    price: int
    image_url: str = ""
    stock: int | None = None  # None = unlimited
    linked_tool_id: str | None = None
    is_active: bool = True
    created_at: datetime | None = None


@dataclass
class Purchase:
    id: str
    user_id: str
    item_id: str
    coins_cost: int
    status: str = "pending"
    fulfilled_by: str | None = None
    created_at: datetime | None = None
    item: MarketplaceItem | None = None
