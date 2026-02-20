from src.coin_economy.domain.repository import AbstractCoinRepository


class BalanceQueryService:
    def __init__(self, repo: AbstractCoinRepository) -> None:
        self._repo = repo

    async def get_balance(self, user_id: str) -> dict:
        balance = await self._repo.get_balance(user_id)
        if not balance:
            return {"balance": 0, "total_earned": 0, "total_spent": 0}
        return {
            "balance": balance.balance,
            "total_earned": balance.total_earned,
            "total_spent": balance.total_spent,
        }

    async def get_transactions(
        self, user_id: str, skip: int = 0, limit: int = 50
    ) -> list[dict]:
        txs = await self._repo.list_transactions(user_id, skip=skip, limit=limit)
        return [
            {
                "id": tx.id,
                "action_type": tx.action_type,
                "amount": tx.amount,
                "status": tx.status,
                "description": tx.description,
                "quality_score": tx.quality_score,
                "created_at": tx.created_at,
            }
            for tx in txs
        ]
