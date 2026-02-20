from src.config import settings


class AgentService:
    """Orchestrates chat graph invocation."""

    def __init__(self, graph, checkpointer, store) -> None:
        self._graph = graph
        self._checkpointer = checkpointer
        self._store = store

    async def invoke_chat(
        self,
        session_id: str,
        user_id: str,
        message: str,
        model: str | None = None,
    ) -> dict:
        config = {
            "configurable": {
                "thread_id": session_id,
            }
        }
        result = await self._graph.ainvoke(
            {
                "messages": [("user", message)],
                "user_id": user_id,
                "session_id": session_id,
                "model": model or settings.OLLAMA_DEFAULT_MODEL,
            },
            config,
        )
        return {
            "messages": result.get("messages", []),
            "coins_earned": result.get("coins_earned", 0),
            "input_blocked": result.get("input_blocked", False),
            "output_blocked": result.get("output_blocked", False),
            "guardrail_reason": result.get("guardrail_reason", ""),
        }

    async def get_session_history(self, session_id: str) -> list[dict]:
        config = {"configurable": {"thread_id": session_id}}
        checkpoints = []
        async for state in self._graph.aget_state_history(config):
            checkpoints.append({
                "checkpoint_id": state.config["configurable"].get("checkpoint_id"),
                "node": state.metadata.get("source"),
                "messages_count": len(state.values.get("messages", [])),
                "tool_calls_count": state.values.get("tool_calls_count", 0),
            })
        return checkpoints
