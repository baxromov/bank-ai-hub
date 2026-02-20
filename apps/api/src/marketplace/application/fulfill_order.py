from src.marketplace.domain.repository import AbstractMarketplaceRepository
from src.marketplace.domain.events import PurchaseFulfilled
from src.event_bus.bus import event_bus


class FulfillOrderUseCase:
    def __init__(self, repo: AbstractMarketplaceRepository) -> None:
        self._repo = repo

    async def fulfill(self, purchase_id: str, admin_id: str) -> dict:
        purchase = await self._repo.get_purchase(purchase_id)
        if not purchase:
            raise ValueError(f"Purchase {purchase_id} not found")

        purchase.status = "fulfilled"
        purchase.fulfilled_by = admin_id
        await self._repo.update_purchase(purchase)

        item = await self._repo.get_item(purchase.item_id)
        item_name = item.name_ru if item else "Unknown"

        await event_bus.publish(PurchaseFulfilled(
            user_id=purchase.user_id,
            purchase_id=purchase_id,
            item_name=item_name,
        ))

        return {"status": "fulfilled", "purchase_id": purchase_id}
