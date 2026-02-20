import uuid
from sqlalchemy import select, desc, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.notifications.models import NotificationModel


class NotificationService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self,
        user_id: str,
        type: str,
        title: str,
        message: str = "",
        data: dict | None = None,
        sender_id: str | None = None,
    ) -> dict:
        notification = NotificationModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            sender_id=sender_id,
            type=type,
            title=title,
            message=message,
            data=data or {},
        )
        self._session.add(notification)
        await self._session.flush()
        return {
            "id": notification.id,
            "type": type,
            "title": title,
            "message": message,
        }

    async def list_for_user(
        self, user_id: str, unread_only: bool = False, limit: int = 50
    ) -> list[dict]:
        stmt = (
            select(NotificationModel)
            .where(NotificationModel.user_id == user_id)
        )
        if unread_only:
            stmt = stmt.where(NotificationModel.is_read == False)
        stmt = stmt.order_by(desc(NotificationModel.created_at)).limit(limit)
        result = await self._session.execute(stmt)
        return [
            {
                "id": n.id,
                "type": n.type,
                "title": n.title,
                "message": n.message,
                "data": n.data,
                "is_read": n.is_read,
                "created_at": n.created_at,
            }
            for n in result.scalars().all()
        ]

    async def mark_as_read(self, notification_id: str, user_id: str) -> None:
        stmt = (
            update(NotificationModel)
            .where(
                NotificationModel.id == notification_id,
                NotificationModel.user_id == user_id,
            )
            .values(is_read=True)
        )
        await self._session.execute(stmt)

    async def mark_all_read(self, user_id: str) -> None:
        stmt = (
            update(NotificationModel)
            .where(
                NotificationModel.user_id == user_id,
                NotificationModel.is_read == False,
            )
            .values(is_read=True)
        )
        await self._session.execute(stmt)

    async def unread_count(self, user_id: str) -> int:
        stmt = (
            select(func.count())
            .select_from(NotificationModel)
            .where(
                NotificationModel.user_id == user_id,
                NotificationModel.is_read == False,
            )
        )
        result = await self._session.execute(stmt)
        return result.scalar() or 0
