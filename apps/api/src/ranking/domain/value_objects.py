from enum import Enum


class RankingCategory(str, Enum):
    AI_INNOVATOR = "ai_innovator"          # Most creative AI usage
    BEST_OPTIMIZER = "best_optimizer"       # Best process optimization
    AI_CONTRIBUTOR = "ai_contributor"       # Most tools created/shared
    SILENT_HERO = "silent_hero"            # Consistent daily usage


class BadgeCategory(str, Enum):
    COINS = "coins"
    PROMPTS = "prompts"
    TOOLS = "tools"
    STREAK = "streak"
    RANK = "rank"
