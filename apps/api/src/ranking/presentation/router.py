import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import get_session
from src.identity.presentation.guards import get_current_user_id, require_admin
from src.ranking.domain.entities import UserBadge
from src.ranking.infrastructure.repository import SqlAlchemyRankingRepository
from src.ranking.infrastructure.models import RankingEntryModel
from src.ranking.application.leaderboard import LeaderboardService, get_current_week
from src.ranking.presentation.schemas import RankingEntryResponse, HighlightsResponse
from src.ranking.application.badge_checker import BadgeCheckerService
from src.ranking.domain.events import BadgeEarned
from src.event_bus.bus import event_bus
from src.coin_economy.infrastructure.models import CoinBalanceModel, CoinTransactionModel
from src.notifications.service import NotificationService
from src.identity.infrastructure.models import UserModel

router = APIRouter()


async def _leaderboard_with_names(
    session: AsyncSession, category: str, week: int, year: int, limit: int
) -> list[dict]:
    stmt = (
        select(
            RankingEntryModel.user_id,
            RankingEntryModel.score,
            RankingEntryModel.rank,
            RankingEntryModel.week_number,
            RankingEntryModel.year,
            RankingEntryModel.category,
            UserModel.first_name,
            UserModel.last_name,
            UserModel.department,
            UserModel.position,
        )
        .join(UserModel, UserModel.id == RankingEntryModel.user_id)
        .where(
            RankingEntryModel.category == category,
            RankingEntryModel.week_number == week,
            RankingEntryModel.year == year,
        )
        .order_by(RankingEntryModel.rank)
        .limit(limit)
    )
    result = await session.execute(stmt)
    rows = result.all()
    return [
        {
            "user_id": r.user_id,
            "full_name": f"{r.first_name} {r.last_name}",
            "department": r.department.value if hasattr(r.department, "value") else str(r.department),
            "position": r.position,
            "category": r.category,
            "score": r.score,
            "rank": r.rank,
            "week_number": r.week_number,
            "year": r.year,
        }
        for r in rows
    ]


@router.get("/current")
async def get_current_leaderboard(
    category: str = Query("ai_innovator"),
    limit: int = Query(20, le=100),
    session: AsyncSession = Depends(get_session),
):
    week, year = get_current_week()
    return await _leaderboard_with_names(session, category, week, year, limit)


@router.get("/category/{category}")
async def get_by_category(
    category: str,
    limit: int = Query(20, le=100),
    session: AsyncSession = Depends(get_session),
):
    week, year = get_current_week()
    return await _leaderboard_with_names(session, category, week, year, limit)


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


# ─── Badges ───────────────────────────────────────────────────────────────────

@router.get("/badges")
async def list_all_badges(session: AsyncSession = Depends(get_session)):
    repo = SqlAlchemyRankingRepository(session)
    badges = await repo.list_badges()
    return [
        {
            "id": b.id, "name": b.name, "name_ru": b.name_ru,
            "description": b.description, "icon_url": b.icon_url,
            "category": b.category, "threshold": b.threshold,
        }
        for b in badges
    ]


@router.get("/me/badges")
async def get_my_badges(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyRankingRepository(session)
    all_badges = await repo.list_badges()
    user_badges = await repo.get_user_badges(user_id)
    earned_map = {ub.badge_id: ub.earned_at for ub in user_badges}

    week, year = get_current_week()
    result = []
    for badge in all_badges:
        entry = await repo.get_user_ranking(user_id, badge.category, week, year)
        score = entry.score if entry else 0.0
        progress_pct = min(score / badge.threshold * 100, 100.0) if badge.threshold > 0 else 0.0
        result.append({
            "id": badge.id,
            "name": badge.name,
            "name_ru": badge.name_ru,
            "description": badge.description,
            "icon_url": badge.icon_url,
            "category": badge.category,
            "threshold": badge.threshold,
            "earned": badge.id in earned_map,
            "earned_at": earned_map.get(badge.id),
            "progress": int(score),
            "progress_pct": round(progress_pct, 1),
        })
    return result


class AwardBadgeRequest(BaseModel):
    user_id: str
    badge_name: str
    reason: str = ""


@router.post("/badges/award")
async def award_badge_manually(
    body: AwardBadgeRequest,
    session: AsyncSession = Depends(get_session),
    admin_id: str = Depends(get_current_user_id),
    _: str = Depends(require_admin),
):
    repo = SqlAlchemyRankingRepository(session)
    badge = await repo.get_badge_by_name(body.badge_name)
    if not badge:
        raise HTTPException(status_code=404, detail=f"Badge '{body.badge_name}' not found")

    if await repo.has_badge(body.user_id, badge.id):
        raise HTTPException(status_code=409, detail="User already has this badge")

    user_badge = UserBadge(
        id=str(uuid.uuid4()),
        user_id=body.user_id,
        badge_id=badge.id,
        earned_at=datetime.now(timezone.utc),
    )
    await repo.award_badge(user_badge)

    await event_bus.publish(BadgeEarned(
        user_id=body.user_id,
        badge_id=badge.id,
        badge_name=badge.name,
    ))

    notif_svc = NotificationService(session)
    reason_text = f" Причина: {body.reason}" if body.reason else ""
    await notif_svc.create(
        user_id=body.user_id,
        type="badge_earned",
        title=f"Вы получили значок «{badge.name_ru}»! 🏅",
        message=f"{badge.description}{reason_text}",
        data={"badge_id": badge.id, "badge_name": badge.name},
    )

    await session.commit()
    return {"awarded": True, "badge": badge.name_ru, "user_id": body.user_id}


# ─── RPG Level ────────────────────────────────────────────────────────────────

_LEVELS = [
    {"index": 0, "name": "Стажёр",    "name_uz": "Стажёр",   "xp_min": 0,     "xp_max": 999},
    {"index": 1, "name": "Аналитик",  "name_uz": "Аналитик", "xp_min": 1000,  "xp_max": 2999},
    {"index": 2, "name": "Специалист","name_uz": "Специалист","xp_min": 3000,  "xp_max": 5999},
    {"index": 3, "name": "Эксперт",   "name_uz": "Эксперт",  "xp_min": 6000,  "xp_max": 9999},
    {"index": 4, "name": "Магистр",   "name_uz": "Магистр",  "xp_min": 10000, "xp_max": 19999},
    {"index": 5, "name": "Легенда Банка", "name_uz": "Банк Афсонаси", "xp_min": 20000, "xp_max": 999999},
]


@router.get("/me/level")
async def get_my_level(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    # total_earned from coin balance
    balance_row = await session.get(CoinBalanceModel, user_id)
    total_earned = balance_row.total_earned if balance_row else 0

    # badge count
    repo = SqlAlchemyRankingRepository(session)
    user_badges = await repo.get_user_badges(user_id)
    badge_count = len(user_badges)

    # game count (transactions with action_type = game_reward)
    game_stmt = (
        select(func.count())
        .select_from(CoinTransactionModel)
        .where(
            CoinTransactionModel.user_id == user_id,
            CoinTransactionModel.action_type == "game_reward",
        )
    )
    game_result = await session.execute(game_stmt)
    game_count = game_result.scalar() or 0

    xp = int(total_earned * 10 + badge_count * 500 + game_count * 50)

    level = _LEVELS[0]
    for lvl in _LEVELS:
        if xp >= lvl["xp_min"]:
            level = lvl

    xp_in_level = xp - level["xp_min"]
    xp_range = level["xp_max"] - level["xp_min"] + 1
    pct = round(min(xp_in_level / xp_range * 100, 100.0), 1)

    next_level = _LEVELS[level["index"] + 1] if level["index"] < len(_LEVELS) - 1 else None

    return {
        "xp": xp,
        "level_index": level["index"],
        "level_name": level["name"],
        "xp_in_level": xp_in_level,
        "xp_next_level": next_level["xp_min"] if next_level else None,
        "pct": pct,
        "total_earned_coins": total_earned,
        "badge_count": badge_count,
        "game_count": game_count,
    }


# ─── Department (Team Battles) ────────────────────────────────────────────────

_DEPT_LABELS: dict[str, str] = {
    "it": "IT-отдел",
    "hr": "HR",
    "risk": "Управление рисками",
    "sales": "Продажи",
    "operations": "Операции",
    "finance": "Финансы",
    "legal": "Юридический",
    "marketing": "Маркетинг",
}


@router.get("/departments")
async def get_department_leaderboard(
    session: AsyncSession = Depends(get_session),
):
    week, year = get_current_week()
    stmt = (
        select(
            UserModel.department,
            func.sum(RankingEntryModel.score).label("total_score"),
            func.count(RankingEntryModel.user_id.distinct()).label("member_count"),
        )
        .join(RankingEntryModel, RankingEntryModel.user_id == UserModel.id)
        .where(
            RankingEntryModel.week_number == week,
            RankingEntryModel.year == year,
        )
        .group_by(UserModel.department)
        .order_by(func.sum(RankingEntryModel.score).desc())
    )
    result = await session.execute(stmt)
    rows = result.all()

    result_list = []
    for idx, row in enumerate(rows):
        dept_val = row.department.value if hasattr(row.department, "value") else str(row.department)
        result_list.append({
            "department": dept_val,
            "department_label": _DEPT_LABELS.get(dept_val, dept_val),
            "total_score": round(float(row.total_score), 1),
            "member_count": row.member_count,
            "rank": idx + 1,
        })
    return result_list


@router.get("/departments/me")
async def get_my_department_ranking(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    user = await session.get(UserModel, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    week, year = get_current_week()

    # Personal contribution this week
    personal_stmt = (
        select(func.sum(RankingEntryModel.score))
        .where(
            RankingEntryModel.user_id == user_id,
            RankingEntryModel.week_number == week,
            RankingEntryModel.year == year,
        )
    )
    personal_result = await session.execute(personal_stmt)
    my_score = float(personal_result.scalar() or 0)

    # Department total
    dept_stmt = (
        select(func.sum(RankingEntryModel.score))
        .join(UserModel, UserModel.id == RankingEntryModel.user_id)
        .where(
            UserModel.department == user.department,
            RankingEntryModel.week_number == week,
            RankingEntryModel.year == year,
        )
    )
    dept_result = await session.execute(dept_stmt)
    dept_total = float(dept_result.scalar() or 0)

    dept_value = user.department.value if hasattr(user.department, "value") else str(user.department)
    return {
        "department": dept_value,
        "department_label": _DEPT_LABELS.get(dept_value, dept_value),
        "my_contribution": round(my_score, 1),
        "department_total": round(dept_total, 1),
    }
