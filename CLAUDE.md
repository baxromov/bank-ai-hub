# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BankAI Hub** — internal AI platform for Ipoteka Bank. Combines an on-premise LLM (Ollama, any model), a corporate currency system (IB-Coin), gamification (rankings, badges, RPG levels, team battles), an MCP tool marketplace, and AI-assisted workflows for bank employees.

## Monorepo Structure

Turborepo + pnpm workspaces. Three workspaces:

- **`apps/api/`** — Python 3.12 FastAPI backend (DDD, async SQLAlchemy, LangGraph)
- **`apps/web/`** — Next.js 15 frontend (App Router, React 19, Tailwind CSS 4, Zustand)
- **`packages/contracts/`** — Shared TypeScript types matching backend Pydantic schemas
- **`docker/`** — Docker Compose with PostgreSQL 16, Redis 7, Ollama, Nginx

## Build & Dev Commands

### Root (monorepo)
```bash
pnpm install          # install all workspace deps
pnpm dev              # start all apps via turbo
pnpm build            # build all apps
pnpm lint             # lint all
pnpm type-check       # type-check all
```

### Backend (`apps/api/`)
```bash
pip install -e ".[dev]"                          # install with dev deps
uvicorn src.main:app --reload --port 8000        # run dev server
python -m pytest                                 # run all tests
python -m pytest tests/test_foo.py::test_bar     # run single test
ruff check .                                     # lint
ruff format .                                    # format
mypy src                                         # type check (strict mode)
alembic revision --autogenerate -m "description" # create migration
alembic upgrade head                             # apply migrations
python -m scripts.seed                           # seed initial data
celery -A src.celery_app worker --loglevel=info  # run celery worker
celery -A src.celery_app beat --loglevel=info    # run celery scheduler
```

### Frontend (`apps/web/`)
```bash
pnpm dev              # next dev --turbopack
pnpm build            # next build
pnpm lint             # next lint
tsc --noEmit          # type check
```

### Docker (from `docker/`)
```bash
docker compose up                                                              # full stack
docker compose -f docker-compose.yml -f docker-compose.dev.yml up              # infra only (pg, redis, ollama)
docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile full up  # all services
```

## Backend Architecture

### Bounded Contexts (DDD)

Each module under `apps/api/src/` follows a 4-layer Clean Architecture:

```
{context}/
  domain/        → entities, value_objects, repository (ABC), events, services
  application/   → use cases (one file per use case)
  infrastructure/→ SQLAlchemy models, repository impl, external clients
  presentation/  → FastAPI router, Pydantic schemas, guards
```

**Contexts:** `identity`, `coin_economy`, `ranking`, `ai_interaction`, `ai_agents`, `tool_platform`, `marketplace`, `suggestions`
**Supporting:** `notifications` (WebSocket), `audit` (middleware + logger)

#### Gamification Features (added)
- **RPG Level system** — `GET /api/rankings/me/level` computes XP from existing coin transactions + badges + game plays (no migration needed). Levels: Стажёр → Аналитик → Специалист → Эксперт → Магистр → Легенда Банка
- **Team Battles** — `GET /api/rankings/departments` and `GET /api/rankings/departments/me` — aggregate scores by `users.department` JOIN `ranking_entries` (no migration needed)
- **Badge award API** — `POST /api/rankings/badges/award` — admin manual award with notification
- **Suggestion dividends** — `PATCH /api/suggestions/{id}/implement` — marks implemented, awards 25 coins to author
- **Customer service badges** — `smile_master`, `problem_solver`, `fast_helper` added to seed data

### App Assembly

`src/main.py` uses the factory pattern (`create_app()`) with an async lifespan that registers event handlers on startup and disposes the DB engine on shutdown. Swagger/ReDoc are only available when `APP_DEBUG=True` at `/api/docs` and `/api/redoc`. Health check at `GET /api/health`.

### Router Prefix Map

| Prefix | Context |
|--------|---------|
| `/api/auth` | Identity |
| `/api/coins` | Coin Economy |
| `/api/rankings` | Ranking |
| `/api/chat` | AI Interaction |
| `/api/agents` | AI Agents |
| `/api/tools` | Tool Platform |
| `/api/marketplace` | Marketplace |
| `/api/suggestions` | Suggestions |
| `/api/notifications` | Notifications |
| `/api/admin/audit-logs` | Audit |

### Database Patterns

- **Async SQLAlchemy 2.0** with `asyncpg` driver
- `Base` declarative base in `src/database/base.py` with `TimestampMixin` (created_at/updated_at) and `UUIDMixin` (UUID string PKs)
- Two session patterns:
  - **FastAPI dependency:** `get_session` from `src/database/session.py` — inject into route handlers
  - **Unit of Work:** `SqlAlchemyUnitOfWork` from `src/database/unit_of_work.py` — async context manager with explicit `commit()`/`rollback()`, auto-rollbacks on exception
- Repository pattern: abstract in `domain/repository.py`, concrete in `infrastructure/repository.py`
- Alembic migrations in `apps/api/alembic/` — **all models must be imported in `alembic/env.py`** for autogenerate to detect them. When adding a new bounded context, add its model imports there.
- Alembic uses `DATABASE_URL_SYNC` (psycopg2 driver) for offline mode and `DATABASE_URL` (asyncpg) for online migrations.

### Event Bus

In-process async pub/sub in `src/event_bus/`. Domain events are frozen dataclasses extending `DomainEvent`. Handlers wired in `src/event_bus/handlers.py`, registered at app startup via `register_all_handlers()` in the FastAPI lifespan.

Cross-context flows: CoinsEarned → Notification + WebSocket push, BadgeEarned → Notification, PromptSent → Audit log.

### Auth & Guards

JWT-based (python-jose). FastAPI dependencies in `src/identity/presentation/guards.py`:
- `get_current_user_id` — extracts user_id from Bearer token
- `require_admin` — ensures ADMIN or SUPER_ADMIN role

Roles: `employee`, `dept_head`, `admin`, `super_admin`

### WebSocket Notifications

`src/notifications/websocket.py` — singleton `ws_manager` (ConnectionManager) with per-user connection tracking. Use `ws_manager.send_to_user(user_id, data)` for targeted messages, `ws_manager.broadcast(data)` for all connected users.

### LangGraph Agent Architecture

`src/ai_agents/graphs/chat_agent.py` implements a ReAct agent as a StateGraph:

```
START → input_guard → load_memory → build_context → agent ↔ tools → output_guard → save_memory → coin_award → END
```

- **State:** `ChatAgentState` TypedDict with messages, user context, guardrail flags
- **Guardrails:** Regex-based input validation (injection, PII) and output filtering (sensitive data) in `infrastructure/guardrails/`
- **Context Engineering:** Dynamic system prompt assembly with department-specific templates, token budget management in `infrastructure/context/`
- **Quality Evaluator:** Separate graph in `graphs/quality_evaluator.py` with LangGraph interrupt for admin approval on high coin awards (>30)
- **Persistence:** Currently stubbed (`infrastructure/persistence.py` returns `None, None`). AsyncPostgresSaver/AsyncPostgresStore planned for Phase 2.

### Celery Tasks

`src/celery_app.py` with Redis broker. Timezone: `Asia/Tashkent`. Auto-discovers tasks in `src.ranking` and `src.coin_economy`. Scheduled tasks:
- Weekly ranking recalculation (Monday midnight)
- Daily badge eligibility check (1 AM)

## Frontend Architecture

### Design System — "Banking Clarity"

Dark monochrome workspace with **IB-Coin gold (#D4A843) as the only accent color**. Defined as CSS custom properties in `apps/web/src/app/globals.css`.

- Typography: IBM Plex Sans (body), IBM Plex Mono (numbers)
- Backgrounds: #0A0A0B (primary) → #222226 (elevated)
- Gold accent: #D4A843 (standard), #F0C75E (bright), #8A7035 (dim)
- All UI text in Russian

### State Management

- **Zustand** stores in `src/stores/` — auth (JWT tokens), chat (sessions/messages/streaming), notifications
- **API client** in `src/api-client/index.ts` — typed fetch wrapper with JWT injection from localStorage, `ApiError` class for error handling, domain-specific method groups (`authApi`, `chatApi`, `coinsApi`, etc.)

### Route Groups

- `(auth)/login` — login page
- `(dashboard)/` — main app wrapped in AppShell (Sidebar + Header), auth-guarded
- Pages: dashboard, chat, coins, rankings, marketplace, tools, tools/create, suggestions, achievements, profile, admin, settings

### Component Organization

- `components/layout/` — AppShell, Sidebar, Header, CoinBalanceDisplay
- `components/ui/` — Button, Card, Badge, Input, EmptyState (shadcn/ui-style with variants)
- `components/coins/` — CoinBadge, TransactionRow
- `components/rankings/` — RankBadge, TrendIndicator
- `components/chat/` — PromptInput, MessageBubble, CoinEarnInline
- `components/feedback/` — CoinToast

## Code Conventions

### Python (Ruff)
- Target: Python 3.12, line length 100
- Rules: E, F, I, N, W, UP
- Mypy strict mode enabled
- Pytest with `asyncio_mode = "auto"`

### TypeScript
- Strict mode, bundler module resolution
- Path aliases: `@/*` → `./src/*`, `@contracts/*` → contracts package
- `@ib-ai-hub/contracts` is a workspace dependency — Next.js config transpiles it via `transpilePackages`

### Shared Contracts

`packages/contracts/src/api-types.ts` contains TypeScript interfaces that mirror backend Pydantic schemas. When modifying backend schemas, update the corresponding types here.

## Configuration

All config via environment variables, loaded by Pydantic Settings in `src/config.py` (single `Settings` class, loads `.env`). Copy `.env.example` to `apps/api/.env`. Key variables:

- `DATABASE_URL` — async PostgreSQL connection string (asyncpg driver)
- `DATABASE_URL_SYNC` — sync PostgreSQL connection string (used by Alembic offline mode)
- `OLLAMA_HOST` / `OLLAMA_DEFAULT_MODEL` — LLM endpoint (any Ollama-compatible model, default `qwen2.5:7b`)
- `JWT_SECRET_KEY` — must change in production
- `REDIS_URL` / `CELERY_BROKER_URL` — Redis connections (different DB indexes)
- `CORS_ORIGINS` — comma-separated list, parsed via `cors_origins_list` property
- `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WS_URL` — frontend API endpoints

## Seed Data

`python -m scripts.seed` creates: super admin (admin@ipotekabank.uz / admin123), demo user (demo@ipotekabank.uz / demo123), 5 coin accrual rules, 10 badges (7 standard + 3 customer_service), 6 marketplace items.

`python -m scripts.demo_seed` creates full demo dataset: 18 employees across all 8 departments (Uzbek names), coin balances + 514 transactions (last 30 days), ranking entries for current week (72 rows), 18 badge awards, 8 suggestions, 5 marketplace purchases, 5 chat sessions, 17 notifications. Demo logins: `sarvinoz.hasanova@ipotekabank.uz / demo123`, `aziz.karimov@ipotekabank.uz / demo123`. Script is idempotent — safe to re-run.

## Chat Model Configuration

The LLM model used in AI Chat is configured via `OLLAMA_DEFAULT_MODEL` in `.env`. The model selector has been removed from the frontend — model is set automatically from the backend config and displayed as a read-only indicator. `GET /api/chat/models` returns `{ models, default_model }` where `default_model` comes from `settings.OLLAMA_DEFAULT_MODEL`.
