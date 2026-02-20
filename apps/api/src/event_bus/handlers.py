"""Cross-context domain event handler wiring.

Each handler reacts to a domain event by performing a side-effect
(notification, ranking update, audit log, etc.) in a different
bounded context.
"""

from src.database.session import async_session_factory
from src.event_bus.bus import event_bus
from src.event_bus.events import DomainEvent

# Domain events
from src.coin_economy.domain.events import CoinsEarned, CoinsSpent, TransactionApproved
from src.ranking.domain.events import RankChanged, BadgeEarned
from src.ai_interaction.domain.events import PromptSent, ResponseGenerated
from src.marketplace.domain.events import ItemPurchased, PurchaseFulfilled

# Services
from src.notifications.service import NotificationService
from src.notifications.websocket import ws_manager
from src.audit.service import AuditLogger


# ─── Coin Economy → Notifications ────────────────────────────────────
async def on_coins_earned(event: DomainEvent) -> None:
    assert isinstance(event, CoinsEarned)
    async with async_session_factory() as session:
        notif_svc = NotificationService(session)
        await notif_svc.create(
            user_id=event.user_id,
            type="coin_earned",
            title="Монеты начислены",
            message=f"+{event.amount} IB за {event.action_type}",
            data={"amount": event.amount, "new_balance": event.new_balance},
        )
        await session.commit()
    await ws_manager.send_to_user(event.user_id, {
        "type": "coin_earned",
        "amount": event.amount,
        "new_balance": event.new_balance,
        "action_type": event.action_type,
    })


async def on_coins_spent(event: DomainEvent) -> None:
    assert isinstance(event, CoinsSpent)
    async with async_session_factory() as session:
        notif_svc = NotificationService(session)
        await notif_svc.create(
            user_id=event.user_id,
            type="coin_spent",
            title="Монеты списаны",
            message=f"-{event.amount} IB за {event.action_type}",
            data={"amount": event.amount, "new_balance": event.new_balance},
        )
        await session.commit()


async def on_transaction_approved(event: DomainEvent) -> None:
    assert isinstance(event, TransactionApproved)
    async with async_session_factory() as session:
        notif_svc = NotificationService(session)
        await notif_svc.create(
            user_id=event.user_id,
            type="transaction_approved",
            title="Транзакция подтверждена",
            message=f"Транзакция на {event.amount} IB подтверждена",
            data={"transaction_id": event.transaction_id, "amount": event.amount},
        )
        await session.commit()
    await ws_manager.send_to_user(event.user_id, {
        "type": "transaction_approved",
        "transaction_id": event.transaction_id,
        "amount": event.amount,
        "new_balance": event.new_balance,
    })


# ─── Ranking → Notifications ─────────────────────────────────────────
async def on_rank_changed(event: DomainEvent) -> None:
    assert isinstance(event, RankChanged)
    direction = "вверх" if event.new_rank < event.old_rank else "вниз"
    async with async_session_factory() as session:
        notif_svc = NotificationService(session)
        await notif_svc.create(
            user_id=event.user_id,
            type="rank_changed",
            title="Изменение рейтинга",
            message=f"Ваш ранг в категории {event.category}: #{event.new_rank} ({direction})",
            data={
                "category": event.category,
                "old_rank": event.old_rank,
                "new_rank": event.new_rank,
            },
        )
        await session.commit()
    await ws_manager.send_to_user(event.user_id, {
        "type": "rank_changed",
        "category": event.category,
        "old_rank": event.old_rank,
        "new_rank": event.new_rank,
    })


async def on_badge_earned(event: DomainEvent) -> None:
    assert isinstance(event, BadgeEarned)
    async with async_session_factory() as session:
        notif_svc = NotificationService(session)
        await notif_svc.create(
            user_id=event.user_id,
            type="badge_earned",
            title="Новый бейдж!",
            message=f"Вы получили бейдж: {event.badge_name}",
            data={"badge_id": event.badge_id, "badge_name": event.badge_name},
        )
        await session.commit()
    await ws_manager.send_to_user(event.user_id, {
        "type": "badge_earned",
        "badge_id": event.badge_id,
        "badge_name": event.badge_name,
    })


# ─── Marketplace → Notifications ─────────────────────────────────────
async def on_item_purchased(event: DomainEvent) -> None:
    assert isinstance(event, ItemPurchased)
    async with async_session_factory() as session:
        notif_svc = NotificationService(session)
        await notif_svc.create(
            user_id=event.user_id,
            type="purchase",
            title="Покупка совершена",
            message=f"Вы приобрели «{event.item_name}» за {event.coins_cost} IB",
            data={"item_id": event.item_id, "item_name": event.item_name},
        )
        await session.commit()


async def on_purchase_fulfilled(event: DomainEvent) -> None:
    assert isinstance(event, PurchaseFulfilled)
    async with async_session_factory() as session:
        notif_svc = NotificationService(session)
        await notif_svc.create(
            user_id=event.user_id,
            type="purchase_fulfilled",
            title="Заказ выполнен",
            message=f"Ваш заказ «{event.item_name}» выполнен",
            data={"purchase_id": event.purchase_id, "item_name": event.item_name},
        )
        await session.commit()
    await ws_manager.send_to_user(event.user_id, {
        "type": "purchase_fulfilled",
        "purchase_id": event.purchase_id,
        "item_name": event.item_name,
    })


# ─── AI Interaction → Audit ──────────────────────────────────────────
async def on_prompt_sent(event: DomainEvent) -> None:
    assert isinstance(event, PromptSent)
    async with async_session_factory() as session:
        logger = AuditLogger(session)
        await logger.log(
            user_id=event.user_id,
            action="ai.prompt_sent",
            entity="chat_session",
            entity_id=event.session_id,
            new_value={"model": event.model, "prompt_length": event.prompt_length},
        )
        await session.commit()


async def on_response_generated(event: DomainEvent) -> None:
    assert isinstance(event, ResponseGenerated)
    async with async_session_factory() as session:
        logger = AuditLogger(session)
        await logger.log(
            user_id=event.user_id,
            action="ai.response_generated",
            entity="chat_session",
            entity_id=event.session_id,
            new_value={"token_count": event.token_count, "latency_ms": event.latency_ms},
        )
        await session.commit()


# ─── Registration ─────────────────────────────────────────────────────
def register_all_handlers() -> None:
    """Register all domain event handlers. Called during app startup."""
    # Coin Economy events
    event_bus.subscribe(CoinsEarned, on_coins_earned)
    event_bus.subscribe(CoinsSpent, on_coins_spent)
    event_bus.subscribe(TransactionApproved, on_transaction_approved)

    # Ranking events
    event_bus.subscribe(RankChanged, on_rank_changed)
    event_bus.subscribe(BadgeEarned, on_badge_earned)

    # Marketplace events
    event_bus.subscribe(ItemPurchased, on_item_purchased)
    event_bus.subscribe(PurchaseFulfilled, on_purchase_fulfilled)

    # AI Interaction events → Audit
    event_bus.subscribe(PromptSent, on_prompt_sent)
    event_bus.subscribe(ResponseGenerated, on_response_generated)
