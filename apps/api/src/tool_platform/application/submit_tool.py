import uuid
from src.tool_platform.domain.entities import McpTool, ToolManifest
from src.tool_platform.domain.repository import AbstractToolRepository


class SubmitToolUseCase:
    def __init__(self, repo: AbstractToolRepository) -> None:
        self._repo = repo

    async def execute(
        self, author_id: str, name: str, display_name: str,
        description: str, category: str, prompt_template: str,
        department: str | None = None,
        input_schema: dict | None = None,
    ) -> McpTool:
        manifest = ToolManifest(
            name=name,
            description=description,
            input_schema=input_schema or {},
        )
        tool = McpTool(
            id=str(uuid.uuid4()),
            author_id=author_id,
            name=name,
            display_name=display_name,
            description=description,
            category=category,
            department=department,
            manifest=manifest,
            prompt_template=prompt_template,
            status="submitted",
        )
        return await self._repo.create_tool(tool)
