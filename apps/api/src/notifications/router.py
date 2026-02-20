from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import get_session
from src.identity.presentation.guards import get_current_user_id
from src.identity.infrastructure.jwt_provider import decode_token
from src.notifications.service import NotificationService
from src.notifications.websocket import ws_manager

router = APIRouter()


@router.get("/")
async def list_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50, le=100),
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    service = NotificationService(session)
    return await service.list_for_user(user_id, unread_only=unread_only, limit=limit)


@router.get("/unread-count")
async def unread_count(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    service = NotificationService(session)
    count = await service.unread_count(user_id)
    return {"count": count}


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    service = NotificationService(session)
    await service.mark_as_read(notification_id, user_id)
    await session.commit()
    return {"status": "ok"}


@router.patch("/read-all")
async def mark_all_read(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    service = NotificationService(session)
    await service.mark_all_read(user_id)
    await session.commit()
    return {"status": "ok"}


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001)
            return
    except ValueError:
        await websocket.close(code=4001)
        return

    await ws_manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(user_id, websocket)
