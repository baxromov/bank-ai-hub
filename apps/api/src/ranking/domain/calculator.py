from dataclasses import dataclass


@dataclass
class UserScore:
    user_id: str
    score: float


class RankingCalculator:
    """Calculate ranking scores for each category."""

    @staticmethod
    def calculate_ai_innovator(
        prompt_count: int,
        avg_quality: float,
        unique_topics: int,
    ) -> float:
        return (prompt_count * 0.3) + (avg_quality * 100 * 0.5) + (unique_topics * 0.2)

    @staticmethod
    def calculate_best_optimizer(
        documents_created: int,
        tools_used: int,
        time_saved_minutes: int,
    ) -> float:
        return (documents_created * 2.0) + (tools_used * 1.5) + (time_saved_minutes * 0.1)

    @staticmethod
    def calculate_ai_contributor(
        tools_created: int,
        tools_shared: int,
        tool_usage_by_others: int,
        suggestions_submitted: int,
    ) -> float:
        return (
            (tools_created * 5.0)
            + (tools_shared * 3.0)
            + (tool_usage_by_others * 0.5)
            + (suggestions_submitted * 2.0)
        )

    @staticmethod
    def calculate_silent_hero(
        active_days: int,
        total_interactions: int,
        consistency_score: float,
    ) -> float:
        return (active_days * 3.0) + (total_interactions * 0.1) + (consistency_score * 50)
