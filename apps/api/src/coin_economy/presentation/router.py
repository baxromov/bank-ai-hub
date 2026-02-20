from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import get_session
from src.identity.presentation.guards import get_current_user_id, require_admin
from src.coin_economy.infrastructure.repository import SqlAlchemyCoinRepository
from src.coin_economy.application.earn_coins import EarnCoinsUseCase
from src.coin_economy.application.spend_coins import SpendCoinsUseCase
from src.coin_economy.application.approve_tx import ApproveTransactionUseCase, TransactionNotFoundError
from src.coin_economy.application.balance_query import BalanceQueryService
from src.coin_economy.domain.services import InsufficientBalanceError
from src.coin_economy.presentation.schemas import (
    BalanceResponse,
    TransactionResponse,
    EarnRequest,
    AdminAwardRequest,
    ApproveRequest,
    RuleResponse,
)

router = APIRouter()


@router.get("/balance", response_model=BalanceResponse)
async def get_balance(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyCoinRepository(session)
    service = BalanceQueryService(repo)
    return await service.get_balance(user_id)


@router.get("/transactions", response_model=list[TransactionResponse])
async def get_transactions(
    skip: int = 0,
    limit: int = 50,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyCoinRepository(session)
    service = BalanceQueryService(repo)
    return await service.get_transactions(user_id, skip=skip, limit=limit)


@router.post("/earn")
async def earn_coins(
    body: EarnRequest,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyCoinRepository(session)
    use_case = EarnCoinsUseCase(repo)
    result = await use_case.execute(
        user_id=user_id,
        action_type=body.action_type,
        description=body.description,
        quality_score=body.quality_score,
    )
    await session.commit()
    return result


@router.post("/award")
async def admin_award(
    body: AdminAwardRequest,
    session: AsyncSession = Depends(get_session),
    admin_id: str = Depends(get_current_user_id),
    _: str = Depends(require_admin),
):
    repo = SqlAlchemyCoinRepository(session)
    use_case = EarnCoinsUseCase(repo)
    result = await use_case.execute(
        user_id=body.user_id,
        action_type="admin_award",
        description=body.description,
        metadata={"awarded_by": admin_id},
    )
    await session.commit()
    return result


@router.patch("/transactions/{tx_id}/approve")
async def approve_transaction(
    tx_id: str,
    body: ApproveRequest,
    session: AsyncSession = Depends(get_session),
    reviewer_id: str = Depends(get_current_user_id),
    _: str = Depends(require_admin),
):
    repo = SqlAlchemyCoinRepository(session)
    use_case = ApproveTransactionUseCase(repo)
    try:
        if body.action == "approve":
            result = await use_case.approve(tx_id, reviewer_id)
        else:
            result = await use_case.reject(tx_id, reviewer_id)
        await session.commit()
        return result
    except TransactionNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/rules", response_model=list[RuleResponse])
async def get_rules(session: AsyncSession = Depends(get_session)):
    repo = SqlAlchemyCoinRepository(session)
    rules = await repo.list_rules()
    return [
        RuleResponse(
            id=r.id,
            action_type=r.action_type,
            min_amount=r.min_amount,
            max_amount=r.max_amount,
            auto_approve=r.auto_approve,
            is_active=r.is_active,
        )
        for r in rules
    ]
