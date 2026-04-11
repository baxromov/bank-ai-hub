from src.suggestions.domain.repository import AbstractSuggestionRepository


class SuggestionNotFoundError(Exception):
    pass


class ReviewSuggestionUseCase:
    def __init__(self, repo: AbstractSuggestionRepository) -> None:
        self._repo = repo

    async def approve(
        self, suggestion_id: str, reviewer_id: str, coin_reward: int = 0,
    ) -> dict:
        suggestion = await self._repo.get_by_id(suggestion_id)
        if not suggestion:
            raise SuggestionNotFoundError(f"Suggestion {suggestion_id} not found")

        suggestion.status = "approved"
        suggestion.reviewed_by = reviewer_id
        suggestion.coin_reward = coin_reward
        await self._repo.update(suggestion)

        return {
            "status": "approved",
            "coin_reward": coin_reward,
            "suggestion_id": suggestion_id,
        }

    async def reject(self, suggestion_id: str, reviewer_id: str) -> dict:
        suggestion = await self._repo.get_by_id(suggestion_id)
        if not suggestion:
            raise SuggestionNotFoundError(f"Suggestion {suggestion_id} not found")

        suggestion.status = "rejected"
        suggestion.reviewed_by = reviewer_id
        await self._repo.update(suggestion)

        return {"status": "rejected", "suggestion_id": suggestion_id}

    async def implement(self, suggestion_id: str, reviewer_id: str) -> dict:
        suggestion = await self._repo.get_by_id(suggestion_id)
        if not suggestion:
            raise SuggestionNotFoundError(f"Suggestion {suggestion_id} not found")

        suggestion.status = "implemented"
        suggestion.reviewed_by = reviewer_id
        await self._repo.update(suggestion)

        return {
            "status": "implemented",
            "suggestion_id": suggestion_id,
            "author_id": suggestion.user_id,
            "title": suggestion.title,
        }
