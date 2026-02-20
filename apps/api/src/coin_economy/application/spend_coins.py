from src.coin_economy.domain.repository import AbstractCoinRepository
from src.coin_economy.domain.services import CoinLedger, InsufficientBalanceError
from src.coin_economy.domain.events import CoinsSpent
from src.event_bus.bus import event_bus


class SpendCoinsUseCase:
    def __init__(self, repo: AbstractCoinRepository) -> None:
        self._repo = repo

    async def execute(
        self,
        user_id: str,
        action_type: str,
        amount: int,
        description: str = "",
        metadata: dict | None = None,
    ) -> dict:
        balance = await self._repo.get_balance(user_id)
        if not balance:
            raise InsufficientBalanceError("No balance record found")

        balance, tx = CoinLedger.spend(
            balance=balance,
            action_type=action_type,
            amount=amount,
            description=description,
            metadata=metadata,
        )

        await self._repo.update_balance(balance)
        await self._repo.create_transaction(tx)

        await event_bus.publish(CoinsSpent(
            user_id=user_id,
            amount=amount,
            action_type=action_type,
            new_balance=balance.balance,
        ))

        return {
            "spent": amount,
            "balance": balance.balance,
            "transaction_id": tx.id,
        }
