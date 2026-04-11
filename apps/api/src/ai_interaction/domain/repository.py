from abc import ABC, abstractmethod
from src.ai_interaction.domain.entities import ChatSession, ChatMessage


class AbstractChatRepository(ABC):
    @abstractmethod
    async def create_session(self, session: ChatSession) -> ChatSession: ...

    @abstractmethod
    async def get_session(self, session_id: str) -> ChatSession | None: ...

    @abstractmethod
    async def list_sessions(self, user_id: str, limit: int = 20) -> list[ChatSession]: ...

    @abstractmethod
    async def update_session(self, session: ChatSession) -> ChatSession: ...

    @abstractmethod
    async def add_message(self, message: ChatMessage) -> ChatMessage: ...

    @abstractmethod
    async def get_messages(self, session_id: str, limit: int = 50) -> list[ChatMessage]: ...

    @abstractmethod
    async def delete_session(self, session_id: str) -> None: ...
