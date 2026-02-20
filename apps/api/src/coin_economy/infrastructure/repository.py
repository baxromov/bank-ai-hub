from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from src.coin_economy.domain.entities import CoinBalance, CoinTransaction, CoinRule
from src.coin_economy.domain.repository import AbstractCoinRepository
from src.coin_economy.infrastructure.models import (
    CoinBalanceModel,
    CoinTransactionModel,
    CoinRuleModel,
)


class SqlAlchemyCoinRepository(AbstractCoinRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # --- Balance ---
    def _balance_to_entity(self, m: CoinBalanceModel) -> CoinBalance:
        return CoinBalance(
            user_id=m.user_id,
            balance=m.balance,
            total_earned=m.total_earned,
            total_spent=m.total_spent,
            updated_at=m.updated_at,
        )

    async def get_balance(self, user_id: str) -> CoinBalance | None:
        m = await self._session.get(CoinBalanceModel, user_id)
        return self._balance_to_entity(m) if m else None

    async def create_balance(self, balance: CoinBalance) -> CoinBalance:
        m = CoinBalanceModel(
            user_id=balance.user_id,
            balance=balance.balance,
            total_earned=balance.total_earned,
            total_spent=balance.total_spent,
        )
        self._session.add(m)
        await self._session.flush()
        await self._session.refresh(m)
        return self._balance_to_entity(m)

    async def update_balance(self, balance: CoinBalance) -> CoinBalance:
        m = await self._session.get(CoinBalanceModel, balance.user_id)
        if not m:
            raise ValueError(f"Balance for user {balance.user_id} not found")
        m.balance = balance.balance
        m.total_earned = balance.total_earned
        m.total_spent = balance.total_spent
        await self._session.flush()
        await self._session.refresh(m)
        return self._balance_to_entity(m)

    # --- Transactions ---
    def _tx_to_entity(self, m: CoinTransactionModel) -> CoinTransaction:
        return CoinTransaction(
            id=m.id,
            user_id=m.user_id,
            action_type=m.action_type,
            amount=m.amount,
            status=m.status,
            description=m.description,
            metadata=m.extra_data or {},
            quality_score=m.quality_score,
            reviewed_by=m.reviewed_by,
            created_at=m.created_at,
        )

    async def create_transaction(self, tx: CoinTransaction) -> CoinTransaction:
        m = CoinTransactionModel(
            id=tx.id,
            user_id=tx.user_id,
            action_type=tx.action_type,
            amount=tx.amount,
            status=tx.status,
            description=tx.description,
            extra_data=tx.metadata,
            quality_score=tx.quality_score,
            reviewed_by=tx.reviewed_by,
        )
        self._session.add(m)
        await self._session.flush()
        await self._session.refresh(m)
        return self._tx_to_entity(m)

    async def get_transaction(self, tx_id: str) -> CoinTransaction | None:
        m = await self._session.get(CoinTransactionModel, tx_id)
        return self._tx_to_entity(m) if m else None

    async def update_transaction(self, tx: CoinTransaction) -> CoinTransaction:
        m = await self._session.get(CoinTransactionModel, tx.id)
        if not m:
            raise ValueError(f"Transaction {tx.id} not found")
        m.status = tx.status
        m.reviewed_by = tx.reviewed_by
        await self._session.flush()
        await self._session.refresh(m)
        return self._tx_to_entity(m)

    async def list_transactions(
        self, user_id: str, skip: int = 0, limit: int = 50
    ) -> list[CoinTransaction]:
        stmt = (
            select(CoinTransactionModel)
            .where(CoinTransactionModel.user_id == user_id)
            .order_by(desc(CoinTransactionModel.created_at))
            .offset(skip)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [self._tx_to_entity(m) for m in result.scalars().all()]

    # --- Rules ---
    def _rule_to_entity(self, m: CoinRuleModel) -> CoinRule:
        return CoinRule(
            id=m.id,
            action_type=m.action_type,
            min_amount=m.min_amount,
            max_amount=m.max_amount,
            auto_approve=m.auto_approve,
            is_active=m.is_active,
        )

    async def get_rule(self, action_type: str) -> CoinRule | None:
        stmt = select(CoinRuleModel).where(CoinRuleModel.action_type == action_type)
        result = await self._session.execute(stmt)
        m = result.scalar_one_or_none()
        return self._rule_to_entity(m) if m else None

    async def list_rules(self) -> list[CoinRule]:
        stmt = select(CoinRuleModel)
        result = await self._session.execute(stmt)
        return [self._rule_to_entity(m) for m in result.scalars().all()]
