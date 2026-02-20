from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from src.suggestions.domain.entities import Suggestion
from src.suggestions.domain.repository import AbstractSuggestionRepository
from src.suggestions.infrastructure.models import SuggestionModel


class SqlAlchemySuggestionRepository(AbstractSuggestionRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _to_entity(self, m: SuggestionModel) -> Suggestion:
        return Suggestion(
            id=m.id, user_id=m.user_id, title=m.title,
            description=m.description, department=m.department,
            impact=m.impact, status=m.status,
            coin_reward=m.coin_reward, quality_score=m.quality_score,
            reviewed_by=m.reviewed_by,
            created_at=m.created_at, updated_at=m.updated_at,
        )

    async def create(self, suggestion: Suggestion) -> Suggestion:
        m = SuggestionModel(
            id=suggestion.id, user_id=suggestion.user_id,
            title=suggestion.title, description=suggestion.description,
            department=suggestion.department, impact=suggestion.impact,
            status=suggestion.status,
        )
        self._session.add(m)
        await self._session.flush()
        await self._session.refresh(m)
        return self._to_entity(m)

    async def get_by_id(self, suggestion_id: str) -> Suggestion | None:
        m = await self._session.get(SuggestionModel, suggestion_id)
        return self._to_entity(m) if m else None

    async def list_all(self, skip: int = 0, limit: int = 50, status: str | None = None) -> list[Suggestion]:
        stmt = select(SuggestionModel).order_by(desc(SuggestionModel.created_at))
        if status:
            stmt = stmt.where(SuggestionModel.status == status)
        stmt = stmt.offset(skip).limit(limit)
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def list_by_user(self, user_id: str, limit: int = 20) -> list[Suggestion]:
        stmt = (
            select(SuggestionModel)
            .where(SuggestionModel.user_id == user_id)
            .order_by(desc(SuggestionModel.created_at))
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update(self, suggestion: Suggestion) -> Suggestion:
        m = await self._session.get(SuggestionModel, suggestion.id)
        if not m:
            raise ValueError(f"Suggestion {suggestion.id} not found")
        m.title = suggestion.title
        m.description = suggestion.description
        m.status = suggestion.status
        m.coin_reward = suggestion.coin_reward
        m.quality_score = suggestion.quality_score
        m.reviewed_by = suggestion.reviewed_by
        await self._session.flush()
        await self._session.refresh(m)
        return self._to_entity(m)
