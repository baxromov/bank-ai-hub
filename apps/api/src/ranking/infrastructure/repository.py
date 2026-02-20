from sqlalchemy import select, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from src.ranking.domain.entities import RankingEntry, Badge, UserBadge
from src.ranking.domain.repository import AbstractRankingRepository
from src.ranking.infrastructure.models import RankingEntryModel, BadgeModel, UserBadgeModel


class SqlAlchemyRankingRepository(AbstractRankingRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _entry_to_entity(self, m: RankingEntryModel) -> RankingEntry:
        return RankingEntry(
            id=m.id, user_id=m.user_id, category=m.category,
            week_number=m.week_number, year=m.year,
            score=m.score, rank=m.rank, created_at=m.created_at,
        )

    def _badge_to_entity(self, m: BadgeModel) -> Badge:
        return Badge(
            id=m.id, name=m.name, name_ru=m.name_ru,
            description=m.description, icon_url=m.icon_url,
            category=m.category, threshold=m.threshold,
        )

    async def get_leaderboard(
        self, category: str, week_number: int, year: int, limit: int = 20
    ) -> list[RankingEntry]:
        stmt = (
            select(RankingEntryModel)
            .where(and_(
                RankingEntryModel.category == category,
                RankingEntryModel.week_number == week_number,
                RankingEntryModel.year == year,
            ))
            .order_by(RankingEntryModel.rank)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [self._entry_to_entity(m) for m in result.scalars().all()]

    async def get_user_ranking(
        self, user_id: str, category: str, week_number: int, year: int
    ) -> RankingEntry | None:
        stmt = select(RankingEntryModel).where(and_(
            RankingEntryModel.user_id == user_id,
            RankingEntryModel.category == category,
            RankingEntryModel.week_number == week_number,
            RankingEntryModel.year == year,
        ))
        result = await self._session.execute(stmt)
        m = result.scalar_one_or_none()
        return self._entry_to_entity(m) if m else None

    async def upsert_ranking_entry(self, entry: RankingEntry) -> RankingEntry:
        existing = await self.get_user_ranking(
            entry.user_id, entry.category, entry.week_number, entry.year
        )
        if existing:
            stmt = select(RankingEntryModel).where(RankingEntryModel.id == existing.id)
            result = await self._session.execute(stmt)
            m = result.scalar_one()
            m.score = entry.score
            m.rank = entry.rank
        else:
            m = RankingEntryModel(
                id=entry.id, user_id=entry.user_id, category=entry.category,
                week_number=entry.week_number, year=entry.year,
                score=entry.score, rank=entry.rank,
            )
            self._session.add(m)
        await self._session.flush()
        await self._session.refresh(m)
        return self._entry_to_entity(m)

    async def get_user_rankings_history(
        self, user_id: str, limit: int = 10
    ) -> list[RankingEntry]:
        stmt = (
            select(RankingEntryModel)
            .where(RankingEntryModel.user_id == user_id)
            .order_by(desc(RankingEntryModel.year), desc(RankingEntryModel.week_number))
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [self._entry_to_entity(m) for m in result.scalars().all()]

    async def list_badges(self) -> list[Badge]:
        stmt = select(BadgeModel)
        result = await self._session.execute(stmt)
        return [self._badge_to_entity(m) for m in result.scalars().all()]

    async def get_user_badges(self, user_id: str) -> list[UserBadge]:
        stmt = select(UserBadgeModel).where(UserBadgeModel.user_id == user_id)
        result = await self._session.execute(stmt)
        return [
            UserBadge(id=m.id, user_id=m.user_id, badge_id=m.badge_id, earned_at=m.earned_at)
            for m in result.scalars().all()
        ]

    async def award_badge(self, user_badge: UserBadge) -> UserBadge:
        m = UserBadgeModel(
            id=user_badge.id, user_id=user_badge.user_id,
            badge_id=user_badge.badge_id, earned_at=user_badge.earned_at,
        )
        self._session.add(m)
        await self._session.flush()
        return user_badge

    async def has_badge(self, user_id: str, badge_id: str) -> bool:
        stmt = select(UserBadgeModel).where(and_(
            UserBadgeModel.user_id == user_id,
            UserBadgeModel.badge_id == badge_id,
        ))
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none() is not None
