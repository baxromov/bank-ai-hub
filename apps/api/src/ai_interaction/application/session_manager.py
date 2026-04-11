import uuid
from src.ai_interaction.domain.entities import ChatSession
from src.ai_interaction.domain.repository import AbstractChatRepository
from src.config import settings


class SessionNotFoundError(Exception):
    pass


class SessionManager:
    def __init__(self, repo: AbstractChatRepository) -> None:
        self._repo = repo

    async def create_session(
        self, user_id: str, title: str = "New Chat", model: str | None = None,
        agent_mode: str = "simple_chat",
    ) -> ChatSession:
        model = model or settings.OLLAMA_DEFAULT_MODEL
        session = ChatSession(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=title,
            model=model,
            agent_mode=agent_mode,
        )
        return await self._repo.create_session(session)

    async def get_session(self, session_id: str) -> ChatSession:
        session = await self._repo.get_session(session_id)
        if not session:
            raise SessionNotFoundError(f"Session {session_id} not found")
        return session

    async def list_sessions(self, user_id: str, limit: int = 20) -> list[ChatSession]:
        return await self._repo.list_sessions(user_id, limit)

    async def get_messages(self, session_id: str, limit: int = 50) -> list[dict]:
        messages = await self._repo.get_messages(session_id, limit)
        return [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "tool_calls": m.tool_calls,
                "created_at": m.created_at,
            }
            for m in messages
        ]
