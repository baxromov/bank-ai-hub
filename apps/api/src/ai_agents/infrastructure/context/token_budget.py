"""Context window budget manager."""


class TokenBudget:
    MODEL_LIMITS = {
        "qwen2.5:7b": 4096,
        "qwen2.5:14b": 8192,
        "qwen2.5:32b": 16384,
    }

    ALLOCATION = {
        "system_prompt": 0.25,
        "recent_messages": 0.60,
        "tool_descriptions": 0.05,
        "response_reserve": 0.10,
    }

    def __init__(self, model: str = "qwen2.5:7b") -> None:
        self._limit = self.MODEL_LIMITS.get(model, 4096)

    @property
    def total(self) -> int:
        return self._limit

    def budget_for(self, component: str) -> int:
        ratio = self.ALLOCATION.get(component, 0.0)
        return int(self._limit * ratio)

    def estimate_tokens(self, text: str) -> int:
        """Rough token estimate: ~4 chars per token for English/Russian."""
        return len(text) // 4

    def fits_in_budget(self, text: str, component: str) -> bool:
        return self.estimate_tokens(text) <= self.budget_for(component)
