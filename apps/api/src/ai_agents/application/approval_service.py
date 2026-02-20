class ApprovalService:
    """Handles admin resume of interrupted LangGraph graphs."""

    def __init__(self, graph) -> None:
        self._graph = graph

    async def resume(self, thread_id: str, decision: str) -> dict:
        from langgraph.types import Command
        config = {"configurable": {"thread_id": thread_id}}
        result = await self._graph.ainvoke(
            Command(resume={"decision": decision}),
            config,
        )
        return {"status": "completed", "decision": decision}

    async def list_pending(self) -> list[dict]:
        # Query checkpointer for graphs in interrupted state
        return []
