from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import get_session
from src.identity.presentation.guards import require_admin
from src.audit.service import AuditLogger

router = APIRouter()


@router.get("/")
async def list_audit_logs(
    entity: str | None = Query(None),
    user_id: str | None = Query(None),
    skip: int = 0,
    limit: int = Query(50, le=200),
    session: AsyncSession = Depends(get_session),
    _: str = Depends(require_admin),
):
    logger = AuditLogger(session)
    return await logger.list_logs(
        entity=entity, user_id=user_id, skip=skip, limit=limit
    )
