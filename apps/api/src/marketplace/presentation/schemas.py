from datetime import datetime
from pydantic import BaseModel, Field


class ItemResponse(BaseModel):
    id: str
    name: str
    name_ru: str
    description: str
    category: str
    price: int
    image_url: str = ""
    stock: int | None = None
    linked_tool_id: str | None = None


class PurchaseRequest(BaseModel):
    item_id: str


class PurchaseResponse(BaseModel):
    id: str
    item_id: str
    coins_cost: int
    status: str
    created_at: datetime | None = None


class CreateItemRequest(BaseModel):
    name: str = Field(..., min_length=1)
    name_ru: str = Field(..., min_length=1)
    description: str = ""
    category: str
    price: int = Field(..., gt=0)
    image_url: str = ""
    stock: int | None = None
    linked_tool_id: str | None = None
