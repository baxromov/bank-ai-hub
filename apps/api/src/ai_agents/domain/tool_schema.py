from dataclasses import dataclass, field


@dataclass
class ToolDefinition:
    name: str
    description: str
    input_schema: dict = field(default_factory=dict)
    output_schema: dict | None = None
    source: str = "builtin"  # builtin | db | mcp
