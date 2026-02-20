"""Manages tools from 3 sources: built-in, DB prompt tools, MCP tools."""
from langchain_core.tools import tool, StructuredTool


@tool
def document_helper(query: str) -> str:
    """Help draft or analyze banking documents."""
    return f"[Document helper result for: {query}]"


@tool
def risk_assessment(data: str) -> str:
    """Perform basic risk assessment on provided data."""
    return f"[Risk assessment result for: {data}]"


@tool
def compliance_checker(text: str) -> str:
    """Check text for banking compliance issues."""
    return f"[Compliance check result for: {text}]"


BUILTIN_TOOLS = [document_helper, risk_assessment, compliance_checker]


class ToolRegistry:
    def __init__(self) -> None:
        self._builtin_tools = list(BUILTIN_TOOLS)

    def get_tools_for_user(self, user_id: str) -> list:
        """Get all tools available to a user. Phase 1: built-in only."""
        return list(self._builtin_tools)

    def register_tool(self, tool) -> None:
        self._builtin_tools.append(tool)


tool_registry = ToolRegistry()
