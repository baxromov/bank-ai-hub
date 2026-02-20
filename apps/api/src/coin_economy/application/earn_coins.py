import uuid
from src.coin_economy.domain.entities import CoinBalance
from src.coin_economy.domain.repository import AbstractCoinRepository
from src.coin_economy.domain.services import CoinLedger
from src.coin_economy.domain.rules import calculate_coin_amount
from src.coin_economy.domain.events import CoinsEarned
from src.event_bus.bus import event_bus


class EarnCoinsUseCase:
    def __init__(self, repo: AbstractCoinRepository) -> None:
        self._repo = repo

    async def execute(
        self,
        user_id: str,
        action_type: str,
        description: str = "",
        quality_score: float | None = None,
        metadata: dict | None = None,
    ) -> dict:
        rule = await self._repo.get_rule(action_type)
        if not rule or not rule.is_active:
            return {"earned": 0, "reason": "No active rule for this action"}

        amount = calculate_coin_amount(rule, quality_score)

        balance = await self._repo.get_balance(user_id)
        if not balance:
            balance = CoinBalance(user_id=user_id)
            balance = await self._repo.create_balance(balance)

        balance, tx = CoinLedger.earn(
            balance=balance,
            action_type=action_type,
            amount=amount,
            description=description,
            quality_score=quality_score,
            auto_approve=rule.auto_approve,
            metadata=metadata,
        )

        await self._repo.update_balance(balance)
        await self._repo.create_transaction(tx)

        if rule.auto_approve:
            await event_bus.publish(CoinsEarned(
                user_id=user_id,
                amount=amount,
                action_type=action_type,
                new_balance=balance.balance,
            ))

        return {
            "earned": amount,
            "balance": balance.balance,
            "status": tx.status,
            "transaction_id": tx.id,
        }
