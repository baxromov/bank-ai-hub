import uuid
from src.marketplace.domain.entities import MarketplaceItem
from src.marketplace.domain.repository import AbstractMarketplaceRepository


class ManageItemsUseCase:
    def __init__(self, repo: AbstractMarketplaceRepository) -> None:
        self._repo = repo

    async def create_item(
        self, name: str, name_ru: str, description: str,
        category: str, price: int, image_url: str = "",
        stock: int | None = None, linked_tool_id: str | None = None,
    ) -> MarketplaceItem:
        item = MarketplaceItem(
            id=str(uuid.uuid4()),
            name=name, name_ru=name_ru, description=description,
            category=category, price=price, image_url=image_url,
            stock=stock, linked_tool_id=linked_tool_id,
        )
        return await self._repo.create_item(item)

    async def list_items(self, category: str | None = None) -> list[MarketplaceItem]:
        return await self._repo.list_items(category)

    async def get_item(self, item_id: str) -> MarketplaceItem | None:
        return await self._repo.get_item(item_id)
