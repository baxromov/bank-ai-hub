from src.tool_platform.domain.repository import AbstractToolRepository


class ToolCatalogService:
    def __init__(self, repo: AbstractToolRepository) -> None:
        self._repo = repo

    async def browse(self, category: str | None = None, limit: int = 50) -> list[dict]:
        tools = await self._repo.list_published(category, limit)
        return [
            {
                "id": t.id,
                "name": t.name,
                "display_name": t.display_name,
                "description": t.description,
                "category": t.category,
                "department": t.department,
                "version": t.version,
                "coin_price": t.coin_price,
                "usage_count": t.usage_count,
                "average_rating": t.average_rating,
                "author_id": t.author_id,
            }
            for t in tools
        ]

    async def get_my_tools(self, author_id: str) -> list[dict]:
        tools = await self._repo.list_by_author(author_id)
        return [
            {
                "id": t.id,
                "name": t.name,
                "display_name": t.display_name,
                "status": t.status,
                "usage_count": t.usage_count,
                "coin_reward": t.coin_reward,
            }
            for t in tools
        ]
