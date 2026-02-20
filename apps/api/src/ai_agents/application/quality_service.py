class QualityService:
    """Triggers quality evaluation asynchronously."""

    async def evaluate_async(
        self, user_id: str, session_id: str, messages: list[dict]
    ) -> None:
        # In production, this dispatches to Celery:
        # quality_eval_task.delay(user_id=user_id, session_id=session_id, messages=messages)
        pass
