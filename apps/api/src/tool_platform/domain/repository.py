from abc import ABC, abstractmethod
from src.tool_platform.domain.entities import McpTool, ToolVersion, ToolPermission


class AbstractToolRepository(ABC):
    @abstractmethod
    async def create_tool(self, tool: McpTool) -> McpTool: ...

    @abstractmethod
    async def get_tool(self, tool_id: str) -> McpTool | None: ...

    @abstractmethod
    async def list_published(self, category: str | None = None, limit: int = 50) -> list[McpTool]: ...

    @abstractmethod
    async def list_by_author(self, author_id: str) -> list[McpTool]: ...

    @abstractmethod
    async def update_tool(self, tool: McpTool) -> McpTool: ...

    @abstractmethod
    async def create_version(self, version: ToolVersion) -> ToolVersion: ...

    @abstractmethod
    async def get_versions(self, tool_id: str) -> list[ToolVersion]: ...

    @abstractmethod
    async def grant_permission(self, permission: ToolPermission) -> ToolPermission: ...

    @abstractmethod
    async def has_permission(self, user_id: str, tool_id: str) -> bool: ...

    @abstractmethod
    async def get_user_tools(self, user_id: str) -> list[McpTool]: ...

    @abstractmethod
    async def increment_usage(self, tool_id: str) -> None: ...
