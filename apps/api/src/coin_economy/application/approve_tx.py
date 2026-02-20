from src.coin_economy.domain.repository import AbstractCoinRepository
from src.coin_economy.domain.services import CoinLedger
from src.coin_economy.domain.events import TransactionApproved
from src.event_bus.bus import event_bus


class TransactionNotFoundError(Exception):
    pass


class ApproveTransactionUseCase:
    def __init__(self, repo: AbstractCoinRepository) -> None:
        self._repo = repo

    async def approve(self, tx_id: str, reviewer_id: str) -> dict:
        tx = await self._repo.get_transaction(tx_id)
        if not tx:
            raise TransactionNotFoundError(f"Transaction {tx_id} not found")

        balance = await self._repo.get_balance(tx.user_id)
        if not balance:
            raise TransactionNotFoundError(f"Balance for user {tx.user_id} not found")

        balance, tx = CoinLedger.approve_transaction(balance, tx, reviewer_id)
        await self._repo.update_balance(balance)
        await self._repo.update_transaction(tx)

        await event_bus.publish(TransactionApproved(
            user_id=tx.user_id,
            transaction_id=tx.id,
            amount=tx.amount,
            new_balance=balance.balance,
        ))

        return {"status": "approved", "balance": balance.balance}

    async def reject(self, tx_id: str, reviewer_id: str) -> dict:
        tx = await self._repo.get_transaction(tx_id)
        if not tx:
            raise TransactionNotFoundError(f"Transaction {tx_id} not found")

        tx = CoinLedger.reject_transaction(tx, reviewer_id)
        await self._repo.update_transaction(tx)

        return {"status": "rejected"}
