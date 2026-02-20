from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class ToolManifest:
    name: str
    description: str
    input_schema: dict = field(default_factory=dict)
    output_schema: dict | None = None


@dataclass
class McpTool:
    id: str
    author_id: str
    name: str
    display_name: str
    description: str
    category: str
    department: str | None = None
    manifest: ToolManifest | None = None
    version: str = "1.0.0"
    mcp_transport: str = "http_sse"
    container_image: str | None = None
    status: str = "draft"
    coin_price: int | None = None
    coin_reward: int | None = None
    usage_count: int = 0
    average_rating: float = 0.0
    quality_score: float = 0.0
    prompt_template: str = ""
    created_at: datetime | None = None
    updated_at: datetime | None = None


@dataclass
class ToolVersion:
    id: str
    tool_id: str
    version: str
    changelog: str
    manifest: ToolManifest | None = None
    prompt_template: str = ""
    created_at: datetime | None = None


@dataclass
class ToolPermission:
    id: str
    user_id: str
    tool_id: str
    granted_at: datetime | None = None
    expires_at: datetime | None = None
