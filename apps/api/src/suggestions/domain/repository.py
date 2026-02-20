from abc import ABC, abstractmethod
from src.suggestions.domain.entities import Suggestion


class AbstractSuggestionRepository(ABC):
    @abstractmethod
    async def create(self, suggestion: Suggestion) -> Suggestion: ...

    @abstractmethod
    async def get_by_id(self, suggestion_id: str) -> Suggestion | None: ...

    @abstractmethod
    async def list_all(self, skip: int = 0, limit: int = 50, status: str | None = None) -> list[Suggestion]: ...

    @abstractmethod
    async def list_by_user(self, user_id: str, limit: int = 20) -> list[Suggestion]: ...

    @abstractmethod
    async def update(self, suggestion: Suggestion) -> Suggestion: ...
