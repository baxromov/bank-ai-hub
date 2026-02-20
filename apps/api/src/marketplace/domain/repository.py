from abc import ABC, abstractmethod
from src.marketplace.domain.entities import MarketplaceItem, Purchase


class AbstractMarketplaceRepository(ABC):
    @abstractmethod
    async def list_items(self, category: str | None = None, limit: int = 50) -> list[MarketplaceItem]: ...

    @abstractmethod
    async def get_item(self, item_id: str) -> MarketplaceItem | None: ...

    @abstractmethod
    async def create_item(self, item: MarketplaceItem) -> MarketplaceItem: ...

    @abstractmethod
    async def update_item(self, item: MarketplaceItem) -> MarketplaceItem: ...

    @abstractmethod
    async def create_purchase(self, purchase: Purchase) -> Purchase: ...

    @abstractmethod
    async def get_purchase(self, purchase_id: str) -> Purchase | None: ...

    @abstractmethod
    async def list_purchases(self, user_id: str, limit: int = 50) -> list[Purchase]: ...

    @abstractmethod
    async def list_pending_orders(self, limit: int = 50) -> list[Purchase]: ...

    @abstractmethod
    async def update_purchase(self, purchase: Purchase) -> Purchase: ...
