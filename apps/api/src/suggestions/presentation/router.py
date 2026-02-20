from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import get_session
from src.identity.presentation.guards import get_current_user_id, require_admin
from src.suggestions.infrastructure.repository import SqlAlchemySuggestionRepository
from src.suggestions.application.submit_suggestion import SubmitSuggestionUseCase
from src.suggestions.application.review_suggestion import ReviewSuggestionUseCase, SuggestionNotFoundError
from src.suggestions.presentation.schemas import (
    SubmitSuggestionRequest, SuggestionResponse, ApproveSuggestionRequest,
)

router = APIRouter()


def _to_response(s) -> SuggestionResponse:
    return SuggestionResponse(
        id=s.id, user_id=s.user_id, title=s.title,
        description=s.description, department=s.department,
        impact=s.impact, status=s.status,
        coin_reward=s.coin_reward, quality_score=s.quality_score,
        created_at=s.created_at,
    )


@router.post("/", response_model=SuggestionResponse, status_code=201)
async def submit_suggestion(
    body: SubmitSuggestionRequest,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemySuggestionRepository(session)
    use_case = SubmitSuggestionUseCase(repo)
    suggestion = await use_case.execute(
        user_id=user_id, title=body.title,
        description=body.description, department=body.department,
        impact=body.impact,
    )
    await session.commit()
    return _to_response(suggestion)


@router.get("/", response_model=list[SuggestionResponse])
async def list_suggestions(
    status_filter: str | None = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 50,
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemySuggestionRepository(session)
    suggestions = await repo.list_all(skip=skip, limit=limit, status=status_filter)
    return [_to_response(s) for s in suggestions]


@router.get("/my", response_model=list[SuggestionResponse])
async def my_suggestions(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemySuggestionRepository(session)
    suggestions = await repo.list_by_user(user_id)
    return [_to_response(s) for s in suggestions]


@router.patch("/{suggestion_id}/approve")
async def approve_suggestion(
    suggestion_id: str,
    body: ApproveSuggestionRequest,
    session: AsyncSession = Depends(get_session),
    reviewer_id: str = Depends(get_current_user_id),
    _: str = Depends(require_admin),
):
    repo = SqlAlchemySuggestionRepository(session)
    use_case = ReviewSuggestionUseCase(repo)
    try:
        result = await use_case.approve(suggestion_id, reviewer_id, body.coin_reward)
        await session.commit()
        return result
    except SuggestionNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{suggestion_id}/reject")
async def reject_suggestion(
    suggestion_id: str,
    session: AsyncSession = Depends(get_session),
    reviewer_id: str = Depends(get_current_user_id),
    _: str = Depends(require_admin),
):
    repo = SqlAlchemySuggestionRepository(session)
    use_case = ReviewSuggestionUseCase(repo)
    try:
        result = await use_case.reject(suggestion_id, reviewer_id)
        await session.commit()
        return result
    except SuggestionNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
