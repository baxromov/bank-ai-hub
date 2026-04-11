import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import get_session
from src.identity.presentation.guards import get_current_user_id
from src.ai_interaction.infrastructure.repository import SqlAlchemyChatRepository
from src.ai_interaction.infrastructure.ollama_client import OllamaClient
from src.ai_interaction.application.session_manager import SessionManager, SessionNotFoundError
from src.ai_interaction.application.chat_service import ChatService
from src.ai_interaction.application.stream_chat import StreamChatService
from src.ai_interaction.presentation.schemas import (
    CreateSessionRequest,
    SessionResponse,
    SendMessageRequest,
    MessageResponse,
    StreamRequest,
)

router = APIRouter()
ollama = OllamaClient()


@router.post("/sessions", response_model=SessionResponse, status_code=201)
async def create_session(
    body: CreateSessionRequest,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyChatRepository(session)
    manager = SessionManager(repo)
    chat_session = await manager.create_session(
        user_id=user_id, title=body.title,
        model=body.model, agent_mode=body.agent_mode,
    )
    await session.commit()
    return SessionResponse(
        id=chat_session.id, title=chat_session.title,
        model=chat_session.model, agent_mode=chat_session.agent_mode,
        is_active=chat_session.is_active,
        created_at=chat_session.created_at, updated_at=chat_session.updated_at,
    )


@router.get("/sessions", response_model=list[SessionResponse])
async def list_sessions(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyChatRepository(session)
    manager = SessionManager(repo)
    sessions = await manager.list_sessions(user_id)
    return [
        SessionResponse(
            id=s.id, title=s.title, model=s.model,
            agent_mode=s.agent_mode, is_active=s.is_active,
            created_at=s.created_at, updated_at=s.updated_at,
        )
        for s in sessions
    ]


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session_detail(
    session_id: str,
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyChatRepository(session)
    manager = SessionManager(repo)
    try:
        s = await manager.get_session(session_id)
        return SessionResponse(
            id=s.id, title=s.title, model=s.model,
            agent_mode=s.agent_mode, is_active=s.is_active,
            created_at=s.created_at, updated_at=s.updated_at,
        )
    except SessionNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/sessions/{session_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    session_id: str,
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyChatRepository(session)
    manager = SessionManager(repo)
    messages = await manager.get_messages(session_id)
    return messages


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyChatRepository(session)
    s = await repo.get_session(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    if s.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    await repo.delete_session(session_id)
    await session.commit()


@router.post("/sessions/{session_id}/messages")
async def send_message(
    session_id: str,
    body: SendMessageRequest,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyChatRepository(session)
    chat_service = ChatService(repo, ollama)
    try:
        s = await repo.get_session(session_id)
        if not s:
            raise HTTPException(status_code=404, detail="Session not found")
        from src.config import settings
        result = await chat_service.send_message(
            session_id=session_id, user_id=user_id,
            content=body.content, model=settings.OLLAMA_DEFAULT_MODEL,
        )
        await session.commit()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream")
async def stream_chat(
    body: StreamRequest,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyChatRepository(session)
    stream_service = StreamChatService(repo, ollama)

    from src.config import settings as _settings
    async def event_generator():
        async for chunk in stream_service.stream_message(
            session_id=body.session_id, user_id=user_id,
            content=body.content, model=_settings.OLLAMA_DEFAULT_MODEL,
        ):
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        yield "data: [DONE]\n\n"
        await session.commit()

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/models")
async def list_models():
    from src.config import settings
    try:
        models = await ollama.list_models()
        return {"models": models, "default_model": settings.OLLAMA_DEFAULT_MODEL}
    except Exception:
        return {"models": [], "default_model": settings.OLLAMA_DEFAULT_MODEL, "error": "Ollama not available"}
