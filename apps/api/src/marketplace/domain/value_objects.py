from enum import Enum


class MarketplaceCategory(str, Enum):
    PROFESSIONAL = "professional"
    WORK_PRIVILEGES = "work_privileges"
    BONUSES = "bonuses"
    MCP_TOOLS = "mcp_tools"


class PurchaseStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    FULFILLED = "fulfilled"
    REJECTED = "rejected"
