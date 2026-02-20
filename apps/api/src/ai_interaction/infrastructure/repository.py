from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from src.ai_interaction.domain.entities import ChatSession, ChatMessage
from src.ai_interaction.domain.repository import AbstractChatRepository
from src.ai_interaction.infrastructure.models import ChatSessionModel, ChatMessageModel


class SqlAlchemyChatRepository(AbstractChatRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _session_to_entity(self, m: ChatSessionModel) -> ChatSession:
        return ChatSession(
            id=m.id, user_id=m.user_id, title=m.title,
            model=m.model, agent_mode=m.agent_mode,
            is_active=m.is_active,
            created_at=m.created_at, updated_at=m.updated_at,
        )

    def _message_to_entity(self, m: ChatMessageModel) -> ChatMessage:
        return ChatMessage(
            id=m.id, session_id=m.session_id, role=m.role,
            content=m.content, token_count=m.token_count,
            latency_ms=m.latency_ms, tool_calls=m.tool_calls or [],
            created_at=m.created_at,
        )

    async def create_session(self, session: ChatSession) -> ChatSession:
        m = ChatSessionModel(
            id=session.id, user_id=session.user_id, title=session.title,
            model=session.model, agent_mode=session.agent_mode,
        )
        self._session.add(m)
        await self._session.flush()
        await self._session.refresh(m)
        return self._session_to_entity(m)

    async def get_session(self, session_id: str) -> ChatSession | None:
        m = await self._session.get(ChatSessionModel, session_id)
        return self._session_to_entity(m) if m else None

    async def list_sessions(self, user_id: str, limit: int = 20) -> list[ChatSession]:
        stmt = (
            select(ChatSessionModel)
            .where(ChatSessionModel.user_id == user_id)
            .order_by(desc(ChatSessionModel.updated_at))
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [self._session_to_entity(m) for m in result.scalars().all()]

    async def update_session(self, session: ChatSession) -> ChatSession:
        m = await self._session.get(ChatSessionModel, session.id)
        if not m:
            raise ValueError(f"Session {session.id} not found")
        m.title = session.title
        m.is_active = session.is_active
        await self._session.flush()
        await self._session.refresh(m)
        return self._session_to_entity(m)

    async def add_message(self, message: ChatMessage) -> ChatMessage:
        m = ChatMessageModel(
            id=message.id, session_id=message.session_id, role=message.role,
            content=message.content, token_count=message.token_count,
            latency_ms=message.latency_ms, tool_calls=message.tool_calls,
        )
        self._session.add(m)
        await self._session.flush()
        await self._session.refresh(m)
        return self._message_to_entity(m)

    async def get_messages(self, session_id: str, limit: int = 50) -> list[ChatMessage]:
        stmt = (
            select(ChatMessageModel)
            .where(ChatMessageModel.session_id == session_id)
            .order_by(ChatMessageModel.created_at)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [self._message_to_entity(m) for m in result.scalars().all()]
