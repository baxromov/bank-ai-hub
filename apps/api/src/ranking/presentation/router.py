from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import get_session
from src.identity.presentation.guards import get_current_user_id
from src.ranking.infrastructure.repository import SqlAlchemyRankingRepository
from src.ranking.application.leaderboard import LeaderboardService
from src.ranking.presentation.schemas import RankingEntryResponse, HighlightsResponse

router = APIRouter()


@router.get("/current", response_model=list[RankingEntryResponse])
async def get_current_leaderboard(
    category: str = Query("ai_innovator"),
    limit: int = Query(20, le=100),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyRankingRepository(session)
    service = LeaderboardService(repo)
    entries = await service.get_current_leaderboard(category, limit)
    return entries


@router.get("/category/{category}", response_model=list[RankingEntryResponse])
async def get_by_category(
    category: str,
    limit: int = Query(20, le=100),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyRankingRepository(session)
    service = LeaderboardService(repo)
    return await service.get_current_leaderboard(category, limit)


@router.get("/highlights", response_model=HighlightsResponse)
async def get_highlights(session: AsyncSession = Depends(get_session)):
    repo = SqlAlchemyRankingRepository(session)
    service = LeaderboardService(repo)
    return await service.get_highlights()


@router.get("/user/{user_id}")
async def get_user_ranking(
    user_id: str,
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyRankingRepository(session)
    service = LeaderboardService(repo)
    history = await service.get_user_history(user_id)
    return {"user_id": user_id, "history": history}


@router.get("/me")
async def get_my_ranking(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyRankingRepository(session)
    service = LeaderboardService(repo)
    categories = ["ai_innovator", "best_optimizer", "ai_contributor", "silent_hero"]
    ranks = {}
    for cat in categories:
        rank = await service.get_user_rank(user_id, cat)
        ranks[cat] = rank
    return {"user_id": user_id, "rankings": ranks}
