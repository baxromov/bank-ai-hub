from src.ranking.domain.repository import AbstractRankingRepository
from src.ranking.domain.entities import UserBadge
from src.ranking.domain.events import BadgeEarned
from src.event_bus.bus import event_bus
import uuid
from datetime import datetime, timezone


class BadgeCheckerService:
    def __init__(self, repo: AbstractRankingRepository) -> None:
        self._repo = repo

    async def check_and_award(self, user_id: str, stats: dict) -> list[str]:
        badges = await self._repo.list_badges()
        awarded = []

        for badge in badges:
            if await self._repo.has_badge(user_id, badge.id):
                continue

            stat_value = stats.get(badge.category, 0)
            if stat_value >= badge.threshold:
                user_badge = UserBadge(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    badge_id=badge.id,
                    earned_at=datetime.now(timezone.utc),
                )
                await self._repo.award_badge(user_badge)
                awarded.append(badge.name)

                await event_bus.publish(BadgeEarned(
                    user_id=user_id,
                    badge_id=badge.id,
                    badge_name=badge.name,
                ))

        return awarded
