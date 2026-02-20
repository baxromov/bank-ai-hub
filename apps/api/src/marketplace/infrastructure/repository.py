from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from src.marketplace.domain.entities import MarketplaceItem, Purchase
from src.marketplace.domain.repository import AbstractMarketplaceRepository
from src.marketplace.infrastructure.models import MarketplaceItemModel, PurchaseModel


class SqlAlchemyMarketplaceRepository(AbstractMarketplaceRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _item_to_entity(self, m: MarketplaceItemModel) -> MarketplaceItem:
        return MarketplaceItem(
            id=m.id, name=m.name, name_ru=m.name_ru,
            description=m.description, category=m.category,
            price=m.price, image_url=m.image_url,
            stock=m.stock, linked_tool_id=m.linked_tool_id,
            is_active=m.is_active, created_at=m.created_at,
        )

    def _purchase_to_entity(self, m: PurchaseModel) -> Purchase:
        return Purchase(
            id=m.id, user_id=m.user_id, item_id=m.item_id,
            coins_cost=m.coins_cost, status=m.status,
            fulfilled_by=m.fulfilled_by, created_at=m.created_at,
        )

    async def list_items(self, category: str | None = None, limit: int = 50) -> list[MarketplaceItem]:
        stmt = select(MarketplaceItemModel).where(MarketplaceItemModel.is_active == True)
        if category:
            stmt = stmt.where(MarketplaceItemModel.category == category)
        stmt = stmt.limit(limit)
        result = await self._session.execute(stmt)
        return [self._item_to_entity(m) for m in result.scalars().all()]

    async def get_item(self, item_id: str) -> MarketplaceItem | None:
        m = await self._session.get(MarketplaceItemModel, item_id)
        return self._item_to_entity(m) if m else None

    async def create_item(self, item: MarketplaceItem) -> MarketplaceItem:
        m = MarketplaceItemModel(
            id=item.id, name=item.name, name_ru=item.name_ru,
            description=item.description, category=item.category,
            price=item.price, image_url=item.image_url,
            stock=item.stock, linked_tool_id=item.linked_tool_id,
        )
        self._session.add(m)
        await self._session.flush()
        await self._session.refresh(m)
        return self._item_to_entity(m)

    async def update_item(self, item: MarketplaceItem) -> MarketplaceItem:
        m = await self._session.get(MarketplaceItemModel, item.id)
        if not m:
            raise ValueError(f"Item {item.id} not found")
        m.name = item.name
        m.name_ru = item.name_ru
        m.description = item.description
        m.price = item.price
        m.stock = item.stock
        m.is_active = item.is_active
        await self._session.flush()
        await self._session.refresh(m)
        return self._item_to_entity(m)

    async def create_purchase(self, purchase: Purchase) -> Purchase:
        m = PurchaseModel(
            id=purchase.id, user_id=purchase.user_id, item_id=purchase.item_id,
            coins_cost=purchase.coins_cost, status=purchase.status,
        )
        self._session.add(m)
        await self._session.flush()
        await self._session.refresh(m)
        return self._purchase_to_entity(m)

    async def get_purchase(self, purchase_id: str) -> Purchase | None:
        m = await self._session.get(PurchaseModel, purchase_id)
        return self._purchase_to_entity(m) if m else None

    async def list_purchases(self, user_id: str, limit: int = 50) -> list[Purchase]:
        stmt = (
            select(PurchaseModel)
            .where(PurchaseModel.user_id == user_id)
            .order_by(desc(PurchaseModel.created_at))
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [self._purchase_to_entity(m) for m in result.scalars().all()]

    async def list_pending_orders(self, limit: int = 50) -> list[Purchase]:
        stmt = (
            select(PurchaseModel)
            .where(PurchaseModel.status == "pending")
            .order_by(PurchaseModel.created_at)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [self._purchase_to_entity(m) for m in result.scalars().all()]

    async def update_purchase(self, purchase: Purchase) -> Purchase:
        m = await self._session.get(PurchaseModel, purchase.id)
        if not m:
            raise ValueError(f"Purchase {purchase.id} not found")
        m.status = purchase.status
        m.fulfilled_by = purchase.fulfilled_by
        await self._session.flush()
        await self._session.refresh(m)
        return self._purchase_to_entity(m)
