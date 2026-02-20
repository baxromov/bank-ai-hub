from dataclasses import dataclass


@dataclass
class McpServerInfo:
    tool_id: str
    server_url: str
    status: str = "running"


class McpServerManager:
    """Manages MCP tool server lifecycle. Phase 3 implementation."""

    def __init__(self) -> None:
        self._servers: dict[str, McpServerInfo] = {}

    def get_server_url(self, tool_id: str) -> str | None:
        info = self._servers.get(tool_id)
        return info.server_url if info else None

    async def start_tool_server(self, tool_id: str, container_image: str) -> McpServerInfo:
        # Phase 3: Docker container management
        info = McpServerInfo(
            tool_id=tool_id,
            server_url=f"http://mcp-tool-{tool_id}:8080",
        )
        self._servers[tool_id] = info
        return info

    async def stop_tool_server(self, tool_id: str) -> None:
        self._servers.pop(tool_id, None)

    async def health_check(self, tool_id: str) -> bool:
        return tool_id in self._servers
