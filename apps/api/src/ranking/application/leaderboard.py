from datetime import datetime, timezone
from src.ranking.domain.repository import AbstractRankingRepository


def get_current_week() -> tuple[int, int]:
    now = datetime.now(timezone.utc)
    iso = now.isocalendar()
    return iso.week, iso.year


class LeaderboardService:
    def __init__(self, repo: AbstractRankingRepository) -> None:
        self._repo = repo

    async def get_current_leaderboard(
        self, category: str, limit: int = 20
    ) -> list[dict]:
        week, year = get_current_week()
        entries = await self._repo.get_leaderboard(category, week, year, limit)
        return [
            {
                "user_id": e.user_id,
                "category": e.category,
                "score": e.score,
                "rank": e.rank,
                "week_number": e.week_number,
                "year": e.year,
            }
            for e in entries
        ]

    async def get_user_rank(self, user_id: str, category: str) -> dict | None:
        week, year = get_current_week()
        entry = await self._repo.get_user_ranking(user_id, category, week, year)
        if not entry:
            return None
        return {
            "user_id": entry.user_id,
            "category": entry.category,
            "score": entry.score,
            "rank": entry.rank,
            "week_number": entry.week_number,
            "year": entry.year,
        }

    async def get_user_history(self, user_id: str, limit: int = 10) -> list[dict]:
        entries = await self._repo.get_user_rankings_history(user_id, limit)
        return [
            {
                "category": e.category,
                "score": e.score,
                "rank": e.rank,
                "week_number": e.week_number,
                "year": e.year,
            }
            for e in entries
        ]

    async def get_highlights(self) -> dict:
        week, year = get_current_week()
        categories = ["ai_innovator", "best_optimizer", "ai_contributor", "silent_hero"]
        highlights = {}
        for cat in categories:
            top = await self._repo.get_leaderboard(cat, week, year, limit=3)
            highlights[cat] = [
                {"user_id": e.user_id, "score": e.score, "rank": e.rank}
                for e in top
            ]
        return {"week_number": week, "year": year, "categories": highlights}
