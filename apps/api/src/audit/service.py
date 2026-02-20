import uuid
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from src.audit.models import AuditLogModel


class AuditLogger:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def log(
        self,
        action: str,
        entity: str,
        entity_id: str | None = None,
        user_id: str | None = None,
        old_value: dict | None = None,
        new_value: dict | None = None,
        ip_address: str | None = None,
    ) -> None:
        entry = AuditLogModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            action=action,
            entity=entity,
            entity_id=entity_id,
            old_value=old_value,
            new_value=new_value,
            ip_address=ip_address,
        )
        self._session.add(entry)
        await self._session.flush()

    async def list_logs(
        self,
        entity: str | None = None,
        user_id: str | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[dict]:
        stmt = select(AuditLogModel).order_by(desc(AuditLogModel.created_at))
        if entity:
            stmt = stmt.where(AuditLogModel.entity == entity)
        if user_id:
            stmt = stmt.where(AuditLogModel.user_id == user_id)
        stmt = stmt.offset(skip).limit(limit)
        result = await self._session.execute(stmt)
        return [
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "entity": log.entity,
                "entity_id": log.entity_id,
                "old_value": log.old_value,
                "new_value": log.new_value,
                "ip_address": log.ip_address,
                "created_at": log.created_at,
            }
            for log in result.scalars().all()
        ]
