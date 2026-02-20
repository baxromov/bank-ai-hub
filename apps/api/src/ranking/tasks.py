"""Celery tasks for ranking calculations.

These run on a schedule defined in src/celery_app.py.
"""

import asyncio
from datetime import datetime, timezone

from src.celery_app import celery
from src.database.session import async_session_factory
from src.ranking.infrastructure.repository import SqlAlchemyRankingRepository
from src.ranking.application.leaderboard import LeaderboardService
from src.ranking.application.badge_checker import BadgeCheckerService


async def _calculate_weekly() -> None:
    """Recalculate scores and ranks for the current week across all categories."""
    categories = ["ai_innovator", "best_optimizer", "ai_contributor", "silent_hero"]
    async with async_session_factory() as session:
        repo = SqlAlchemyRankingRepository(session)
        now = datetime.now(timezone.utc)
        iso = now.isocalendar()
        week, year = iso.week, iso.year

        for category in categories:
            entries = await repo.get_leaderboard(category, week, year, limit=1000)
            # Re-rank by score descending
            entries.sort(key=lambda e: e.score, reverse=True)
            for rank, entry in enumerate(entries, start=1):
                entry.rank = rank
            await session.flush()

        await session.commit()


async def _check_badges() -> None:
    """Check badge eligibility for all users with activity this week."""
    async with async_session_factory() as session:
        repo = SqlAlchemyRankingRepository(session)
        service = BadgeCheckerService(repo)
        now = datetime.now(timezone.utc)
        iso = now.isocalendar()
        week, year = iso.week, iso.year

        # Get all users who have a ranking entry this week
        for category in ["ai_innovator", "best_optimizer", "ai_contributor", "silent_hero"]:
            entries = await repo.get_leaderboard(category, week, year, limit=1000)
            for entry in entries:
                await service.check_and_award(entry.user_id)

        await session.commit()


@celery.task(name="src.ranking.tasks.calculate_weekly_rankings")
def calculate_weekly_rankings() -> dict:
    """Celery task: recalculate weekly rankings."""
    asyncio.run(_calculate_weekly())
    return {"status": "completed"}


@celery.task(name="src.ranking.tasks.check_all_badges")
def check_all_badges() -> dict:
    """Celery task: check badge eligibility for all active users."""
    asyncio.run(_check_badges())
    return {"status": "completed"}
