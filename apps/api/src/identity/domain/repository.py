from abc import ABC, abstractmethod
from src.identity.domain.entities import User


class AbstractUserRepository(ABC):
    @abstractmethod
    async def get_by_id(self, user_id: str) -> User | None: ...

    @abstractmethod
    async def get_by_email(self, email: str) -> User | None: ...

    @abstractmethod
    async def get_by_employee_id(self, employee_id: str) -> User | None: ...

    @abstractmethod
    async def list_all(self, skip: int = 0, limit: int = 50) -> list[User]: ...

    @abstractmethod
    async def create(self, user: User) -> User: ...

    @abstractmethod
    async def update(self, user: User) -> User: ...
