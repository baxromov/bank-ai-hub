from enum import Enum


class CoinActionType(str, Enum):
    QUALITY_PROMPT = "quality_prompt"
    DOCUMENT_CREATION = "document_creation"
    TOOL_USAGE = "tool_usage"
    TOOL_CREATION = "tool_creation"
    SUGGESTION = "suggestion"
    WEEKLY_BONUS = "weekly_bonus"
    MARKETPLACE_PURCHASE = "marketplace_purchase"
    ADMIN_AWARD = "admin_award"
    ADMIN_DEDUCTION = "admin_deduction"
    GAME_REWARD = "game_reward"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"
