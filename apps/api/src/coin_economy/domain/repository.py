from abc import ABC, abstractmethod
from src.coin_economy.domain.entities import CoinBalance, CoinTransaction, CoinRule


class AbstractCoinRepository(ABC):
    @abstractmethod
    async def get_balance(self, user_id: str) -> CoinBalance | None: ...

    @abstractmethod
    async def create_balance(self, balance: CoinBalance) -> CoinBalance: ...

    @abstractmethod
    async def update_balance(self, balance: CoinBalance) -> CoinBalance: ...

    @abstractmethod
    async def create_transaction(self, tx: CoinTransaction) -> CoinTransaction: ...

    @abstractmethod
    async def get_transaction(self, tx_id: str) -> CoinTransaction | None: ...

    @abstractmethod
    async def update_transaction(self, tx: CoinTransaction) -> CoinTransaction: ...

    @abstractmethod
    async def list_transactions(
        self, user_id: str, skip: int = 0, limit: int = 50
    ) -> list[CoinTransaction]: ...

    @abstractmethod
    async def get_rule(self, action_type: str) -> CoinRule | None: ...

    @abstractmethod
    async def list_rules(self) -> list[CoinRule]: ...
