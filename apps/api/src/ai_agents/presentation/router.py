from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import get_session
from src.identity.presentation.guards import get_current_user_id, require_admin
from src.ai_agents.presentation.schemas import (
    AgentChatRequest,
    AgentChatResponse,
    AdminDecision,
    CheckpointResponse,
    ReplayRequest,
)

router = APIRouter()

# Note: In production, the chat agent graph is initialized during app startup
# and injected via FastAPI dependencies. For now, endpoints are stubbed.


@router.post("/agent/chat", response_model=AgentChatResponse)
async def agent_chat(
    body: AgentChatRequest,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    # Phase 2: invoke chat_agent_graph
    return AgentChatResponse(
        response="[Agent mode will be available in Phase 2]",
        coins_earned=0,
    )


@router.get("/admin/approvals/pending")
async def list_pending_approvals(
    _: str = Depends(require_admin),
):
    return []


@router.post("/admin/approvals/{thread_id}/resume")
async def resume_approval(
    thread_id: str,
    body: AdminDecision,
    _: str = Depends(require_admin),
):
    return {"status": "completed", "thread_id": thread_id, "decision": body.decision}


@router.get("/admin/sessions/{session_id}/history", response_model=list[CheckpointResponse])
async def get_session_history(
    session_id: str,
    _: str = Depends(require_admin),
):
    return []


@router.post("/admin/sessions/{session_id}/replay")
async def replay_from_checkpoint(
    session_id: str,
    body: ReplayRequest,
    _: str = Depends(require_admin),
):
    return {"status": "replay_started", "session_id": session_id}


@router.post("/admin/sessions/{session_id}/rewind")
async def rewind_to_checkpoint(
    session_id: str,
    body: ReplayRequest,
    _: str = Depends(require_admin),
):
    return {"status": "rewound", "checkpoint_id": body.checkpoint_id}
