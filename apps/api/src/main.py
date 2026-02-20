from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.database.session import engine
from src.event_bus.handlers import register_all_handlers
from src.identity.presentation.router import router as auth_router
from src.coin_economy.presentation.router import router as coins_router
from src.ranking.presentation.router import router as ranking_router
from src.ai_interaction.presentation.router import router as chat_router
from src.marketplace.presentation.router import router as marketplace_router
from src.tool_platform.presentation.router import router as tools_router
from src.suggestions.presentation.router import router as suggestions_router
from src.notifications.router import router as notifications_router
from src.audit.router import router as audit_router
from src.ai_agents.presentation.router import router as agents_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    # Startup
    register_all_handlers()
    yield
    # Shutdown
    await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="0.1.0",
        docs_url="/api/docs" if settings.APP_DEBUG else None,
        redoc_url="/api/redoc" if settings.APP_DEBUG else None,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount routers
    app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
    app.include_router(coins_router, prefix="/api/coins", tags=["Coins"])
    app.include_router(ranking_router, prefix="/api/rankings", tags=["Rankings"])
    app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
    app.include_router(marketplace_router, prefix="/api/marketplace", tags=["Marketplace"])
    app.include_router(tools_router, prefix="/api/tools", tags=["Tools"])
    app.include_router(suggestions_router, prefix="/api/suggestions", tags=["Suggestions"])
    app.include_router(notifications_router, prefix="/api/notifications", tags=["Notifications"])
    app.include_router(audit_router, prefix="/api/admin/audit-logs", tags=["Audit"])
    app.include_router(agents_router, prefix="/api/agents", tags=["AI Agents"])

    @app.get("/api/health")
    async def health_check():
        return {"status": "ok", "service": settings.APP_NAME}

    return app


app = create_app()
