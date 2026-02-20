from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import get_session
from src.identity.presentation.guards import get_current_user_id, require_admin
from src.tool_platform.infrastructure.repository import SqlAlchemyToolRepository
from src.tool_platform.application.submit_tool import SubmitToolUseCase
from src.tool_platform.application.review_tool import ReviewToolUseCase, ToolNotFoundError
from src.tool_platform.application.execute_tool import ExecuteToolUseCase
from src.tool_platform.application.tool_catalog import ToolCatalogService
from src.tool_platform.presentation.schemas import (
    SubmitToolRequest, ToolResponse, ExecuteToolRequest, ApproveToolRequest,
)

router = APIRouter()


@router.get("/", response_model=list[ToolResponse])
async def browse_tools(
    category: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyToolRepository(session)
    service = ToolCatalogService(repo)
    tools = await service.browse(category)
    return tools


@router.post("/", status_code=201)
async def submit_tool(
    body: SubmitToolRequest,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyToolRepository(session)
    use_case = SubmitToolUseCase(repo)
    tool = await use_case.execute(
        author_id=user_id, name=body.name,
        display_name=body.display_name, description=body.description,
        category=body.category, prompt_template=body.prompt_template,
        department=body.department, input_schema=body.input_schema,
    )
    await session.commit()
    return {"id": tool.id, "name": tool.name, "status": tool.status}


@router.get("/my")
async def my_tools(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyToolRepository(session)
    service = ToolCatalogService(repo)
    return await service.get_my_tools(user_id)


@router.get("/{tool_id}")
async def get_tool(
    tool_id: str,
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyToolRepository(session)
    tool = await repo.get_tool(tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return {
        "id": tool.id, "name": tool.name, "display_name": tool.display_name,
        "description": tool.description, "category": tool.category,
        "version": tool.version, "status": tool.status,
        "coin_price": tool.coin_price, "usage_count": tool.usage_count,
        "prompt_template": tool.prompt_template,
    }


@router.post("/{tool_id}/execute")
async def execute_tool(
    tool_id: str,
    body: ExecuteToolRequest,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyToolRepository(session)
    use_case = ExecuteToolUseCase(repo)
    try:
        result = await use_case.execute(tool_id, user_id, body.params)
        await session.commit()
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.patch("/{tool_id}/approve")
async def approve_tool(
    tool_id: str,
    body: ApproveToolRequest,
    session: AsyncSession = Depends(get_session),
    _: str = Depends(require_admin),
):
    repo = SqlAlchemyToolRepository(session)
    use_case = ReviewToolUseCase(repo)
    try:
        result = await use_case.approve(tool_id, body.coin_reward)
        await session.commit()
        return result
    except ToolNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
