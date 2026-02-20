from abc import ABC, abstractmethod
from src.ranking.domain.entities import RankingEntry, Badge, UserBadge


class AbstractRankingRepository(ABC):
    @abstractmethod
    async def get_leaderboard(
        self, category: str, week_number: int, year: int, limit: int = 20
    ) -> list[RankingEntry]: ...

    @abstractmethod
    async def get_user_ranking(
        self, user_id: str, category: str, week_number: int, year: int
    ) -> RankingEntry | None: ...

    @abstractmethod
    async def upsert_ranking_entry(self, entry: RankingEntry) -> RankingEntry: ...

    @abstractmethod
    async def get_user_rankings_history(
        self, user_id: str, limit: int = 10
    ) -> list[RankingEntry]: ...

    @abstractmethod
    async def list_badges(self) -> list[Badge]: ...

    @abstractmethod
    async def get_user_badges(self, user_id: str) -> list[UserBadge]: ...

    @abstractmethod
    async def award_badge(self, user_badge: UserBadge) -> UserBadge: ...

    @abstractmethod
    async def has_badge(self, user_id: str, badge_id: str) -> bool: ...
