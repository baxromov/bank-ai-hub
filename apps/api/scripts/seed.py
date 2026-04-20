"""Database seed script.

Creates initial data: super admin user, coin rules, badges, marketplace items.

Usage:
    python -m scripts.seed

Run from the apps/api directory.
"""

import asyncio
import uuid

from src.config import settings
from src.database.session import async_session_factory
from src.identity.infrastructure.models import UserModel
from src.identity.domain.entities import UserRole, Department
from src.identity.domain.services import hash_password
from src.coin_economy.infrastructure.models import CoinBalanceModel, CoinRuleModel
from src.ranking.infrastructure.models import BadgeModel
from src.marketplace.infrastructure.models import MarketplaceItemModel


async def seed() -> None:
    async with async_session_factory() as session:
        # ─── Super Admin ──────────────────────────────────────────
        admin_id = str(uuid.uuid4())
        admin = UserModel(
            id=admin_id,
            employee_id="ADMIN001",
            email="admin@ipotekabank.uz",
            password_hash=hash_password("admin123"),
            first_name="Админ",
            last_name="Системный",
            role=UserRole.SUPER_ADMIN,
            department=Department.IT,
            position="Системный администратор",
            is_active=True,
        )
        session.add(admin)
        await session.flush()

        # Admin coin balance
        session.add(CoinBalanceModel(
            user_id=admin_id, balance=0, total_earned=0, total_spent=0,
        ))

        # ─── Demo Employee ────────────────────────────────────────
        demo_id = str(uuid.uuid4())
        demo = UserModel(
            id=demo_id,
            employee_id="EMP001",
            email="demo@ipotekabank.uz",
            password_hash=hash_password("demo123"),
            first_name="Демо",
            last_name="Пользователь",
            role=UserRole.EMPLOYEE,
            department=Department.IT,
            position="Разработчик",
            is_active=True,
        )
        session.add(demo)
        await session.flush()

        session.add(CoinBalanceModel(
            user_id=demo_id, balance=100, total_earned=100, total_spent=0,
        ))

        # ─── Coin Accrual Rules ───────────────────────────────────
        coin_rules = [
            CoinRuleModel(
                id=str(uuid.uuid4()),
                action_type="prompt",
                min_amount=1,
                max_amount=3,
                auto_approve=True,
                is_active=True,
            ),
            CoinRuleModel(
                id=str(uuid.uuid4()),
                action_type="quality_prompt",
                min_amount=3,
                max_amount=10,
                auto_approve=True,
                is_active=True,
            ),
            CoinRuleModel(
                id=str(uuid.uuid4()),
                action_type="tool_creation",
                min_amount=20,
                max_amount=50,
                auto_approve=False,
                is_active=True,
            ),
            CoinRuleModel(
                id=str(uuid.uuid4()),
                action_type="suggestion",
                min_amount=5,
                max_amount=25,
                auto_approve=False,
                is_active=True,
            ),
            CoinRuleModel(
                id=str(uuid.uuid4()),
                action_type="weekly_streak",
                min_amount=10,
                max_amount=10,
                auto_approve=True,
                is_active=True,
            ),
            CoinRuleModel(
                id=str(uuid.uuid4()),
                action_type="game_reward",
                min_amount=1,
                max_amount=5,
                auto_approve=True,
                is_active=True,
            ),
        ]
        session.add_all(coin_rules)

        # ─── Badges ───────────────────────────────────────────────
        badges = [
            BadgeModel(
                id=str(uuid.uuid4()),
                name="first_prompt",
                name_ru="Первый запрос",
                description="Отправил первый запрос AI-ассистенту",
                category="ai_innovator",
                threshold=1,
            ),
            BadgeModel(
                id=str(uuid.uuid4()),
                name="prompt_master_100",
                name_ru="100 запросов",
                description="Отправил 100 запросов AI-ассистенту",
                category="ai_innovator",
                threshold=100,
            ),
            BadgeModel(
                id=str(uuid.uuid4()),
                name="quality_writer",
                name_ru="Качественный автор",
                description="Средняя оценка промптов выше 8/10",
                category="best_optimizer",
                threshold=8,
            ),
            BadgeModel(
                id=str(uuid.uuid4()),
                name="tool_creator",
                name_ru="Создатель инструментов",
                description="Опубликовал первый MCP-инструмент",
                category="ai_contributor",
                threshold=1,
            ),
            BadgeModel(
                id=str(uuid.uuid4()),
                name="top3_weekly",
                name_ru="Топ-3 недели",
                description="Попал в топ-3 еженедельного рейтинга",
                category="ai_innovator",
                threshold=3,
            ),
            BadgeModel(
                id=str(uuid.uuid4()),
                name="idea_generator",
                name_ru="Генератор идей",
                description="Подал 5 одобренных предложений",
                category="silent_hero",
                threshold=5,
            ),
            BadgeModel(
                id=str(uuid.uuid4()),
                name="coin_millionaire",
                name_ru="Миллионер IB-Coin",
                description="Накопил 1000 IB-Coin",
                category="ai_innovator",
                threshold=1000,
            ),
            # Mijozlar Qahramoni badges (customer service — awarded manually by admin)
            BadgeModel(
                id=str(uuid.uuid4()),
                name="smile_master",
                name_ru="Мастер улыбки",
                description="Получил высокую оценку клиентов за позитивное обслуживание",
                category="customer_service",
                threshold=1,
            ),
            BadgeModel(
                id=str(uuid.uuid4()),
                name="problem_solver",
                name_ru="Решатель проблем",
                description="Успешно решил сложную проблему клиента",
                category="customer_service",
                threshold=1,
            ),
            BadgeModel(
                id=str(uuid.uuid4()),
                name="fast_helper",
                name_ru="Быстрая помощь",
                description="Обслужил клиента быстрее всех в команде",
                category="customer_service",
                threshold=1,
            ),
        ]
        session.add_all(badges)

        # ─── Marketplace Items ────────────────────────────────────
        marketplace_items = [
            # professional — Обучение
            MarketplaceItemModel(
                id=str(uuid.uuid4()),
                name="Conference Ticket",
                name_ru="Билет на конференцию",
                description="Билет на IT или банковскую конференцию по вашему выбору",
                category="professional",
                price=800,
                stock=5,
                is_active=True,
            ),
            MarketplaceItemModel(
                id=str(uuid.uuid4()),
                name="Online Course Subscription",
                name_ru="Подписка на онлайн-курсы",
                description="3-месячная подписка на Coursera, Udemy или аналогичную платформу",
                category="professional",
                price=400,
                stock=20,
                is_active=True,
            ),
            MarketplaceItemModel(
                id=str(uuid.uuid4()),
                name="Professional Certification",
                name_ru="Оплата профессионального сертификата",
                description="Компания оплачивает один профессиональный сертификат (CFA, PMP, AWS и др.)",
                category="professional",
                price=1200,
                stock=3,
                is_active=True,
            ),
            # work_privileges — Привилегии
            MarketplaceItemModel(
                id=str(uuid.uuid4()),
                name="Extra Day Off",
                name_ru="Дополнительный выходной",
                description="Получите один дополнительный выходной день без вычета из отпуска",
                category="work_privileges",
                price=500,
                stock=10,
                is_active=True,
            ),
            MarketplaceItemModel(
                id=str(uuid.uuid4()),
                name="Lunch with CTO",
                name_ru="Обед с CTO",
                description="Обед с техническим директором — обсудите свои идеи и проекты",
                category="work_privileges",
                price=1000,
                stock=1,
                is_active=True,
            ),
            MarketplaceItemModel(
                id=str(uuid.uuid4()),
                name="Remote Work Week",
                name_ru="Неделя удалённой работы",
                description="Работайте из любого места в течение одной недели",
                category="work_privileges",
                price=700,
                stock=8,
                is_active=True,
            ),
            MarketplaceItemModel(
                id=str(uuid.uuid4()),
                name="Priority Project Choice",
                name_ru="Выбор приоритетного проекта",
                description="Первоочередное право выбора нового проекта или задачи",
                category="work_privileges",
                price=600,
                stock=5,
                is_active=True,
            ),
            # bonuses — Бонусы
            MarketplaceItemModel(
                id=str(uuid.uuid4()),
                name="Corporate T-Shirt",
                name_ru="Корпоративная футболка",
                description="Футболка с логотипом BankAI Hub из качественного хлопка",
                category="bonuses",
                price=150,
                stock=50,
                is_active=True,
            ),
            MarketplaceItemModel(
                id=str(uuid.uuid4()),
                name="Custom Keyboard",
                name_ru="Механическая клавиатура",
                description="Механическая клавиатура на выбор из каталога",
                category="bonuses",
                price=600,
                stock=3,
                is_active=True,
            ),
            MarketplaceItemModel(
                id=str(uuid.uuid4()),
                name="Restaurant Gift Card",
                name_ru="Сертификат в ресторан",
                description="Подарочный сертификат в один из партнёрских ресторанов Ташкента",
                category="bonuses",
                price=300,
                stock=15,
                is_active=True,
            ),
            MarketplaceItemModel(
                id=str(uuid.uuid4()),
                name="Branded Backpack",
                name_ru="Корпоративный рюкзак",
                description="Стильный рюкзак с логотипом Ipoteka Bank",
                category="bonuses",
                price=450,
                stock=10,
                is_active=True,
            ),
            # mcp_tools — AI Инструменты
            MarketplaceItemModel(
                id=str(uuid.uuid4()),
                name="Premium AI Model Access",
                name_ru="Доступ к Premium AI-модели",
                description="Доступ к продвинутой AI-модели (GPT-4 уровень) на 30 дней",
                category="mcp_tools",
                price=200,
                stock=None,
                is_active=True,
            ),
            MarketplaceItemModel(
                id=str(uuid.uuid4()),
                name="Document AI Analyzer",
                name_ru="AI-анализатор документов",
                description="Инструмент для автоматического анализа и резюмирования банковских документов",
                category="mcp_tools",
                price=350,
                stock=None,
                is_active=True,
            ),
            MarketplaceItemModel(
                id=str(uuid.uuid4()),
                name="Smart Report Generator",
                name_ru="Генератор отчётов",
                description="AI-инструмент для автоматической генерации аналитических отчётов",
                category="mcp_tools",
                price=500,
                stock=None,
                is_active=True,
            ),
            MarketplaceItemModel(
                id=str(uuid.uuid4()),
                name="Email AI Assistant",
                name_ru="AI-помощник для писем",
                description="Инструмент для написания профессиональных писем клиентам с помощью AI",
                category="mcp_tools",
                price=150,
                stock=None,
                is_active=True,
            ),
        ]
        session.add_all(marketplace_items)

        await session.commit()
        print("Seed completed successfully!")
        print(f"  Admin: admin@ipotekabank.uz / admin123")
        print(f"  Demo:  demo@ipotekabank.uz / demo123")
        print(f"  Coin rules: {len(coin_rules)}")
        print(f"  Badges: {len(badges)}")
        print(f"  Marketplace items: {len(marketplace_items)}")


if __name__ == "__main__":
    asyncio.run(seed())
