import uuid
from src.marketplace.domain.entities import Purchase
from src.marketplace.domain.repository import AbstractMarketplaceRepository
from src.marketplace.domain.events import ItemPurchased
from src.coin_economy.application.spend_coins import SpendCoinsUseCase
from src.coin_economy.domain.services import InsufficientBalanceError
from src.event_bus.bus import event_bus


class ItemNotFoundError(Exception):
    pass


class OutOfStockError(Exception):
    pass


class PurchaseItemUseCase:
    def __init__(
        self,
        marketplace_repo: AbstractMarketplaceRepository,
        spend_coins: SpendCoinsUseCase,
    ) -> None:
        self._repo = marketplace_repo
        self._spend_coins = spend_coins

    async def execute(self, user_id: str, item_id: str) -> dict:
        item = await self._repo.get_item(item_id)
        if not item or not item.is_active:
            raise ItemNotFoundError(f"Item {item_id} not found or inactive")

        if item.stock is not None and item.stock <= 0:
            raise OutOfStockError(f"Item {item.name} is out of stock")

        # Spend coins
        await self._spend_coins.execute(
            user_id=user_id,
            action_type="marketplace_purchase",
            amount=item.price,
            description=f"Purchase: {item.name_ru}",
            metadata={"item_id": item_id},
        )

        # Decrement stock
        if item.stock is not None:
            item.stock -= 1
            await self._repo.update_item(item)

        # Create purchase record
        purchase = Purchase(
            id=str(uuid.uuid4()),
            user_id=user_id,
            item_id=item_id,
            coins_cost=item.price,
            status="pending",
        )
        purchase = await self._repo.create_purchase(purchase)

        await event_bus.publish(ItemPurchased(
            user_id=user_id,
            item_id=item_id,
            item_name=item.name_ru,
            coins_cost=item.price,
        ))

        return {
            "purchase_id": purchase.id,
            "item_name": item.name_ru,
            "coins_spent": item.price,
            "status": purchase.status,
        }
