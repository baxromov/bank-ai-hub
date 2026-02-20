from sqlalchemy import select, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.tool_platform.domain.entities import McpTool, ToolManifest, ToolVersion, ToolPermission
from src.tool_platform.domain.repository import AbstractToolRepository
from src.tool_platform.infrastructure.models import McpToolModel, ToolVersionModel, ToolPermissionModel


class SqlAlchemyToolRepository(AbstractToolRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _to_entity(self, m: McpToolModel) -> McpTool:
        manifest_data = m.manifest or {}
        manifest = ToolManifest(
            name=manifest_data.get("name", m.name),
            description=manifest_data.get("description", m.description),
            input_schema=manifest_data.get("input_schema", {}),
            output_schema=manifest_data.get("output_schema"),
        )
        return McpTool(
            id=m.id, author_id=m.author_id, name=m.name,
            display_name=m.display_name, description=m.description,
            category=m.category, department=m.department,
            manifest=manifest, version=m.version,
            mcp_transport=m.mcp_transport, container_image=m.container_image,
            status=m.status, coin_price=m.coin_price,
            coin_reward=m.coin_reward, usage_count=m.usage_count,
            average_rating=m.average_rating, quality_score=m.quality_score,
            prompt_template=m.prompt_template,
            created_at=m.created_at, updated_at=m.updated_at,
        )

    async def create_tool(self, tool: McpTool) -> McpTool:
        manifest_dict = {}
        if tool.manifest:
            manifest_dict = {
                "name": tool.manifest.name,
                "description": tool.manifest.description,
                "input_schema": tool.manifest.input_schema,
                "output_schema": tool.manifest.output_schema,
            }
        m = McpToolModel(
            id=tool.id, author_id=tool.author_id, name=tool.name,
            display_name=tool.display_name, description=tool.description,
            category=tool.category, department=tool.department,
            manifest=manifest_dict, version=tool.version,
            status=tool.status, prompt_template=tool.prompt_template,
        )
        self._session.add(m)
        await self._session.flush()
        await self._session.refresh(m)
        return self._to_entity(m)

    async def get_tool(self, tool_id: str) -> McpTool | None:
        m = await self._session.get(McpToolModel, tool_id)
        return self._to_entity(m) if m else None

    async def list_published(self, category: str | None = None, limit: int = 50) -> list[McpTool]:
        stmt = select(McpToolModel).where(McpToolModel.status == "published")
        if category:
            stmt = stmt.where(McpToolModel.category == category)
        stmt = stmt.order_by(desc(McpToolModel.usage_count)).limit(limit)
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def list_by_author(self, author_id: str) -> list[McpTool]:
        stmt = select(McpToolModel).where(McpToolModel.author_id == author_id)
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update_tool(self, tool: McpTool) -> McpTool:
        m = await self._session.get(McpToolModel, tool.id)
        if not m:
            raise ValueError(f"Tool {tool.id} not found")
        m.status = tool.status
        m.coin_price = tool.coin_price
        m.coin_reward = tool.coin_reward
        m.display_name = tool.display_name
        m.description = tool.description
        await self._session.flush()
        await self._session.refresh(m)
        return self._to_entity(m)

    async def create_version(self, version: ToolVersion) -> ToolVersion:
        manifest_dict = {}
        if version.manifest:
            manifest_dict = {
                "name": version.manifest.name,
                "description": version.manifest.description,
                "input_schema": version.manifest.input_schema,
            }
        m = ToolVersionModel(
            id=version.id, tool_id=version.tool_id,
            version=version.version, changelog=version.changelog,
            manifest=manifest_dict, prompt_template=version.prompt_template,
        )
        self._session.add(m)
        await self._session.flush()
        return version

    async def get_versions(self, tool_id: str) -> list[ToolVersion]:
        stmt = select(ToolVersionModel).where(ToolVersionModel.tool_id == tool_id)
        result = await self._session.execute(stmt)
        return [
            ToolVersion(
                id=m.id, tool_id=m.tool_id, version=m.version,
                changelog=m.changelog, prompt_template=m.prompt_template,
                created_at=m.created_at,
            )
            for m in result.scalars().all()
        ]

    async def grant_permission(self, permission: ToolPermission) -> ToolPermission:
        m = ToolPermissionModel(
            id=permission.id, user_id=permission.user_id,
            tool_id=permission.tool_id, expires_at=permission.expires_at,
        )
        self._session.add(m)
        await self._session.flush()
        return permission

    async def has_permission(self, user_id: str, tool_id: str) -> bool:
        stmt = select(ToolPermissionModel).where(and_(
            ToolPermissionModel.user_id == user_id,
            ToolPermissionModel.tool_id == tool_id,
        ))
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def get_user_tools(self, user_id: str) -> list[McpTool]:
        stmt = (
            select(McpToolModel)
            .join(ToolPermissionModel, McpToolModel.id == ToolPermissionModel.tool_id)
            .where(ToolPermissionModel.user_id == user_id)
        )
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def increment_usage(self, tool_id: str) -> None:
        m = await self._session.get(McpToolModel, tool_id)
        if m:
            m.usage_count += 1
            await self._session.flush()
