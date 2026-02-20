from src.tool_platform.domain.repository import AbstractToolRepository
from src.tool_platform.domain.events import ToolPublished
from src.event_bus.bus import event_bus


class ToolNotFoundError(Exception):
    pass


class ReviewToolUseCase:
    def __init__(self, repo: AbstractToolRepository) -> None:
        self._repo = repo

    async def approve(self, tool_id: str, coin_reward: int = 0) -> dict:
        tool = await self._repo.get_tool(tool_id)
        if not tool:
            raise ToolNotFoundError(f"Tool {tool_id} not found")

        tool.status = "published"
        tool.coin_reward = coin_reward
        await self._repo.update_tool(tool)

        await event_bus.publish(ToolPublished(
            tool_id=tool.id,
            tool_name=tool.display_name,
            author_id=tool.author_id,
        ))

        return {"status": "published", "tool_id": tool_id, "coin_reward": coin_reward}

    async def reject(self, tool_id: str) -> dict:
        tool = await self._repo.get_tool(tool_id)
        if not tool:
            raise ToolNotFoundError(f"Tool {tool_id} not found")

        tool.status = "disabled"
        await self._repo.update_tool(tool)
        return {"status": "rejected", "tool_id": tool_id}
