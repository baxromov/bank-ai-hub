"""LangGraph persistence layer using PostgreSQL."""


async def create_langgraph_infra(database_url: str):
    """Initialize LangGraph persistence. Returns (checkpointer, store).
    In production, uses AsyncPostgresSaver and AsyncPostgresStore."""
    # Phase 2: Enable when LangGraph PostgreSQL dependencies are configured
    # from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
    # from langgraph.store.postgres.aio import AsyncPostgresStore
    # checkpointer = AsyncPostgresSaver.from_conn_string(database_url)
    # await checkpointer.setup()
    # store = AsyncPostgresStore.from_conn_string(database_url)
    # await store.setup()
    # return checkpointer, store
    return None, None
