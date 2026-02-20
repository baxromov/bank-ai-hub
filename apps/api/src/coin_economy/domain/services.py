import uuid
from src.coin_economy.domain.entities import CoinBalance, CoinTransaction
from src.coin_economy.domain.value_objects import TransactionStatus


class InsufficientBalanceError(Exception):
    pass


class CoinLedger:
    """Append-only coin ledger. All balance changes go through transactions."""

    @staticmethod
    def earn(
        balance: CoinBalance,
        action_type: str,
        amount: int,
        description: str = "",
        quality_score: float | None = None,
        auto_approve: bool = True,
        metadata: dict | None = None,
    ) -> tuple[CoinBalance, CoinTransaction]:
        status = TransactionStatus.COMPLETED if auto_approve else TransactionStatus.PENDING
        tx = CoinTransaction(
            id=str(uuid.uuid4()),
            user_id=balance.user_id,
            action_type=action_type,
            amount=amount,
            status=status.value,
            description=description,
            quality_score=quality_score,
            metadata=metadata or {},
        )
        if auto_approve:
            balance.balance += amount
            balance.total_earned += amount
        return balance, tx

    @staticmethod
    def spend(
        balance: CoinBalance,
        action_type: str,
        amount: int,
        description: str = "",
        metadata: dict | None = None,
    ) -> tuple[CoinBalance, CoinTransaction]:
        if not balance.can_spend(amount):
            raise InsufficientBalanceError(
                f"Insufficient balance: {balance.balance} < {amount}"
            )
        tx = CoinTransaction(
            id=str(uuid.uuid4()),
            user_id=balance.user_id,
            action_type=action_type,
            amount=-amount,
            status=TransactionStatus.COMPLETED.value,
            description=description,
            metadata=metadata or {},
        )
        balance.balance -= amount
        balance.total_spent += amount
        return balance, tx

    @staticmethod
    def approve_transaction(
        balance: CoinBalance,
        tx: CoinTransaction,
        reviewer_id: str,
    ) -> tuple[CoinBalance, CoinTransaction]:
        tx.status = TransactionStatus.APPROVED.value
        tx.reviewed_by = reviewer_id
        if tx.amount > 0:
            balance.balance += tx.amount
            balance.total_earned += tx.amount
        return balance, tx

    @staticmethod
    def reject_transaction(
        tx: CoinTransaction,
        reviewer_id: str,
    ) -> CoinTransaction:
        tx.status = TransactionStatus.REJECTED.value
        tx.reviewed_by = reviewer_id
        return tx
