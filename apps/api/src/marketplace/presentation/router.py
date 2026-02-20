from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import get_session
from src.identity.presentation.guards import get_current_user_id, require_admin
from src.marketplace.infrastructure.repository import SqlAlchemyMarketplaceRepository
from src.marketplace.application.purchase_item import PurchaseItemUseCase, ItemNotFoundError, OutOfStockError
from src.marketplace.application.manage_items import ManageItemsUseCase
from src.marketplace.application.fulfill_order import FulfillOrderUseCase
from src.coin_economy.infrastructure.repository import SqlAlchemyCoinRepository
from src.coin_economy.application.spend_coins import SpendCoinsUseCase
from src.coin_economy.domain.services import InsufficientBalanceError
from src.marketplace.presentation.schemas import (
    ItemResponse, PurchaseRequest, PurchaseResponse, CreateItemRequest,
)

router = APIRouter()


@router.get("/items", response_model=list[ItemResponse])
async def list_items(
    category: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyMarketplaceRepository(session)
    service = ManageItemsUseCase(repo)
    items = await service.list_items(category)
    return [
        ItemResponse(
            id=i.id, name=i.name, name_ru=i.name_ru,
            description=i.description, category=i.category,
            price=i.price, image_url=i.image_url,
            stock=i.stock, linked_tool_id=i.linked_tool_id,
        )
        for i in items
    ]


@router.post("/purchase")
async def purchase_item(
    body: PurchaseRequest,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    marketplace_repo = SqlAlchemyMarketplaceRepository(session)
    coin_repo = SqlAlchemyCoinRepository(session)
    spend_coins = SpendCoinsUseCase(coin_repo)
    use_case = PurchaseItemUseCase(marketplace_repo, spend_coins)
    try:
        result = await use_case.execute(user_id, body.item_id)
        await session.commit()
        return result
    except ItemNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except OutOfStockError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except InsufficientBalanceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/purchases", response_model=list[PurchaseResponse])
async def list_purchases(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyMarketplaceRepository(session)
    purchases = await repo.list_purchases(user_id)
    return [
        PurchaseResponse(
            id=p.id, item_id=p.item_id, coins_cost=p.coins_cost,
            status=p.status, created_at=p.created_at,
        )
        for p in purchases
    ]


@router.patch("/orders/{purchase_id}/fulfill")
async def fulfill_order(
    purchase_id: str,
    session: AsyncSession = Depends(get_session),
    admin_id: str = Depends(get_current_user_id),
    _: str = Depends(require_admin),
):
    repo = SqlAlchemyMarketplaceRepository(session)
    use_case = FulfillOrderUseCase(repo)
    try:
        result = await use_case.fulfill(purchase_id, admin_id)
        await session.commit()
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(
    body: CreateItemRequest,
    session: AsyncSession = Depends(get_session),
    _: str = Depends(require_admin),
):
    repo = SqlAlchemyMarketplaceRepository(session)
    service = ManageItemsUseCase(repo)
    item = await service.create_item(
        name=body.name, name_ru=body.name_ru, description=body.description,
        category=body.category, price=body.price, image_url=body.image_url,
        stock=body.stock, linked_tool_id=body.linked_tool_id,
    )
    await session.commit()
    return ItemResponse(
        id=item.id, name=item.name, name_ru=item.name_ru,
        description=item.description, category=item.category,
        price=item.price, image_url=item.image_url,
        stock=item.stock, linked_tool_id=item.linked_tool_id,
    )
