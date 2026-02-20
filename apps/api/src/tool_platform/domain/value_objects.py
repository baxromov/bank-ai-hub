from enum import Enum


class ToolStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    PUBLISHED = "published"
    DISABLED = "disabled"


class ToolCategory(str, Enum):
    DOCUMENT = "document"
    ANALYSIS = "analysis"
    AUTOMATION = "automation"
    DATA = "data"
    COMMUNICATION = "communication"


class McpTransport(str, Enum):
    STDIO = "stdio"
    HTTP_SSE = "http_sse"
