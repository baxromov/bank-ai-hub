from src.tool_platform.domain.repository import AbstractToolRepository
from src.tool_platform.domain.events import ToolInvoked
from src.event_bus.bus import event_bus


class ExecuteToolUseCase:
    def __init__(self, repo: AbstractToolRepository) -> None:
        self._repo = repo

    async def execute(self, tool_id: str, user_id: str, params: dict) -> dict:
        tool = await self._repo.get_tool(tool_id)
        if not tool or tool.status != "published":
            raise ValueError(f"Tool {tool_id} not available")

        # Check permission for paid tools
        if tool.coin_price and tool.coin_price > 0:
            has_perm = await self._repo.has_permission(user_id, tool_id)
            if not has_perm:
                raise PermissionError(f"No access to tool {tool_id}. Purchase required.")

        # Phase 1-2: Execute as prompt template with Ollama
        # Phase 3: Execute via MCP server
        result = await self._execute_prompt_tool(tool, params)

        await self._repo.increment_usage(tool_id)

        await event_bus.publish(ToolInvoked(
            tool_id=tool_id,
            user_id=user_id,
            tool_name=tool.name,
        ))

        return {"tool_id": tool_id, "result": result}

    async def _execute_prompt_tool(self, tool, params: dict) -> str:
        """Phase 1-2: Execute tool by rendering its prompt template and calling Ollama."""
        prompt = tool.prompt_template
        for key, value in params.items():
            prompt = prompt.replace(f"{{{{{key}}}}}", str(value))
        # In production, this calls OllamaClient
        return f"[Tool output placeholder for: {tool.name}]"
