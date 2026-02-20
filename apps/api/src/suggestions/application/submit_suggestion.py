import uuid
from src.suggestions.domain.entities import Suggestion
from src.suggestions.domain.repository import AbstractSuggestionRepository


class SubmitSuggestionUseCase:
    def __init__(self, repo: AbstractSuggestionRepository) -> None:
        self._repo = repo

    async def execute(
        self, user_id: str, title: str, description: str,
        department: str, impact: str = "",
    ) -> Suggestion:
        suggestion = Suggestion(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=title,
            description=description,
            department=department,
            impact=impact,
            status="submitted",
        )
        return await self._repo.create(suggestion)
