"""Demo data seed script.

Fills the platform with realistic demo data for presentation:
- 18 employees from all departments
- Coin transaction histories
- Weekly rankings (current week)
- Badge awards for top performers
- Suggestions (submitted / approved / implemented)
- Marketplace purchases
- Chat sessions & messages
- Notifications

Usage (from apps/api/):
    python -m scripts.demo_seed

Safe to re-run: skips already-existing rows via ON CONFLICT DO NOTHING.
"""

import asyncio
import uuid
import random
from datetime import datetime, timezone, timedelta, date

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import async_session_factory
from src.identity.infrastructure.models import UserModel
from src.identity.domain.entities import UserRole, Department
from src.identity.domain.services import hash_password
from src.coin_economy.infrastructure.models import CoinBalanceModel, CoinTransactionModel
from src.ranking.infrastructure.models import RankingEntryModel, BadgeModel, UserBadgeModel
from src.marketplace.infrastructure.models import MarketplaceItemModel, PurchaseModel
from src.suggestions.infrastructure.models import SuggestionModel
from src.notifications.models import NotificationModel
from src.ai_interaction.infrastructure.models import ChatSessionModel, ChatMessageModel

# ─── Helpers ──────────────────────────────────────────────────────────────────

def uid() -> str:
    return str(uuid.uuid4())

def now_utc() -> datetime:
    return datetime.now(timezone.utc)

def days_ago(n: int) -> datetime:
    return now_utc() - timedelta(days=n)

def get_current_week() -> tuple[int, int]:
    iso = date.today().isocalendar()
    return iso.week, iso.year

# ─── Demo Employees ───────────────────────────────────────────────────────────

EMPLOYEES = [
    # IT bo'limi
    dict(employee_id="IT001", email="aziz.karimov@ipotekabank.uz",  first_name="Aziz",    last_name="Каримов",    department=Department.IT,         position="Senior Backend Developer"),
    dict(employee_id="IT002", email="nilufar.rashidova@ipotekabank.uz", first_name="Нилуфар", last_name="Рашидова", department=Department.IT,     position="Frontend Developer"),
    dict(employee_id="IT003", email="bobur.yusupov@ipotekabank.uz",  first_name="Бобур",   last_name="Юсупов",     department=Department.IT,         position="DevOps Engineer"),
    # Finance
    dict(employee_id="FIN001", email="dilnoza.mirzayeva@ipotekabank.uz", first_name="Дилноза", last_name="Мирзаева", department=Department.FINANCE, position="Финансовый аналитик"),
    dict(employee_id="FIN002", email="jamshid.toshmatov@ipotekabank.uz", first_name="Жамшид", last_name="Тошматов",  department=Department.FINANCE, position="Главный бухгалтер"),
    # Sales
    dict(employee_id="SAL001", email="sarvinoz.hasanova@ipotekabank.uz", first_name="Сарвиноз", last_name="Хасанова", department=Department.SALES, position="Менеджер по продажам"),
    dict(employee_id="SAL002", email="ulugbek.normatov@ipotekabank.uz",  first_name="Улугбек", last_name="Норматов",  department=Department.SALES, position="Старший менеджер"),
    dict(employee_id="SAL003", email="malika.sobirova@ipotekabank.uz",   first_name="Малика",  last_name="Собирова",  department=Department.SALES, position="Менеджер по кредитам"),
    # HR
    dict(employee_id="HR001", email="feruza.yoldosheva@ipotekabank.uz",  first_name="Феруза",  last_name="Йолдошева", department=Department.HR,       position="HR-менеджер"),
    dict(employee_id="HR002", email="sherzod.nazarov@ipotekabank.uz",    first_name="Шерзод",  last_name="Назаров",   department=Department.HR,       position="Recruiter"),
    # Operations
    dict(employee_id="OPS001", email="kamola.umarova@ipotekabank.uz",    first_name="Камола",  last_name="Умарова",   department=Department.OPERATIONS, position="Операционный менеджер"),
    dict(employee_id="OPS002", email="ravshan.ergashev@ipotekabank.uz",  first_name="Равшан",  last_name="Эргашев",   department=Department.OPERATIONS, position="Специалист операций"),
    # Risk
    dict(employee_id="RSK001", email="zulfiya.abdullayeva@ipotekabank.uz", first_name="Зульфия", last_name="Абдуллаева", department=Department.RISK,  position="Риск-аналитик"),
    dict(employee_id="RSK002", email="nodir.hamidov@ipotekabank.uz",      first_name="Нодир",  last_name="Хамидов",    department=Department.RISK,      position="Старший риск-менеджер"),
    # Marketing
    dict(employee_id="MRK001", email="gulnora.ismoilova@ipotekabank.uz",  first_name="Гулнора", last_name="Исмоилова", department=Department.MARKETING, position="Маркетолог"),
    dict(employee_id="MRK002", email="timur.bekmurodov@ipotekabank.uz",   first_name="Тимур",  last_name="Бекмуродов", department=Department.MARKETING, position="SMM-специалист"),
    # Legal
    dict(employee_id="LGL001", email="dilorom.xasanova@ipotekabank.uz",   first_name="Дилором", last_name="Хасанова",  department=Department.LEGAL,     position="Юрист"),
    dict(employee_id="LGL002", email="behruz.saidov@ipotekabank.uz",      first_name="Бехруз", last_name="Саидов",    department=Department.LEGAL,      position="Старший юрист"),
    # Training and Development department
    dict(employee_id="TRN001", email="shakhzoda.bendik@ipotekabank.uz",    first_name="Шахзода",  last_name="Бендик",      department=Department.TRAINING, position="Руководитель отдела обучения и развития", role=UserRole.DEPT_HEAD),
    dict(employee_id="TRN002", email="gulnoza.lutfullaeva@ipotekabank.uz", first_name="Гулноза",  last_name="Лутфуллаева", department=Department.TRAINING, position="Старший менеджер по обучению и развитию"),
    dict(employee_id="TRN003", email="shakhnoza.umarova@ipotekabank.uz",   first_name="Шахноза",  last_name="Умарова",     department=Department.TRAINING, position="Менеджер по обучению и развитию"),
    dict(employee_id="OPS003", email="yevgenia.babaeva@ipotekabank.uz",    first_name="Евгения",  last_name="Бабаева",     department=Department.OPERATIONS, position="Старший операционный специалист"),
]

# Coin & ranking profiles per employee (index-aligned with EMPLOYEES)
PROFILES = [
    # earned, spent, ai_score, opt_score, contrib_score, hero_score
    (850,  200, 120.5, 85.0,  45.0,  210.0),  # IT001 - yaxshi
    (620,  100, 95.0,  70.0,  30.0,  180.0),  # IT002
    (480,   50, 60.0,  95.0,  20.0,  140.0),  # IT003
    (720,  150, 80.0,  110.5, 10.0,  195.0),  # FIN001 - optimizer
    (540,   80, 55.0,  78.0,  8.0,   160.0),  # FIN002
    (930,  300, 140.0, 90.0,  55.0,  240.0),  # SAL001 - top innovator
    (780,  250, 115.0, 75.0,  40.0,  200.0),  # SAL002
    (450,   60, 50.0,  60.0,  15.0,  130.0),  # SAL003
    (380,   40, 40.0,  50.0,  25.0,  120.0),  # HR001
    (290,   20, 30.0,  40.0,  18.0,   95.0),  # HR002
    (560,   90, 70.0,  85.0,  35.0,  170.0),  # OPS001
    (420,   55, 45.0,  65.0,  22.0,  145.0),  # OPS002
    (670,  120, 85.0,  92.0,  28.0,  190.0),  # RSK001
    (510,   70, 60.0,  80.0,  20.0,  155.0),  # RSK002
    (340,   30, 35.0,  48.0,  12.0,  110.0),  # MRK001
    (260,   15, 25.0,  35.0,   8.0,   85.0),  # MRK002
    (190,   10, 18.0,  25.0,   5.0,   70.0),  # LGL001
    (140,    5, 12.0,  18.0,   3.0,   55.0),  # LGL002
    # New employees
    (760,  180, 98.0,  88.0,  42.0,  205.0),  # HR003   - Gulnoza Lutfullaeva
    (880,  220, 125.0, 82.0,  58.0,  230.0),  # SAL004  - Shakhzoda Bendik
    (640,  130, 78.0,  105.0, 35.0,  185.0),  # FIN003  - Shakhnoza Umarova
    (710,  160, 90.0,  96.0,  48.0,  215.0),  # OPS003  - Yevgenia Babaeva
]

CHAT_TOPICS = [
    ("Анализ кредитного портфеля", [
        ("user", "Помоги мне составить отчёт по кредитному портфелю за Q1 2026"),
        ("assistant", "Конечно! Для анализа кредитного портфеля за Q1 2026 нам понадобится структурировать данные по следующим разделам:\n\n**1. Общий объём портфеля**\n- Суммарный остаток задолженности\n- Динамика по сравнению с Q4 2025\n\n**2. Структура по продуктам**\n- Ипотечные кредиты\n- Потребительские кредиты\n- Кредиты бизнесу\n\n**3. Качество портфеля**\n- NPL ratio\n- Резервы\n\nХотите, чтобы я подготовил шаблон для каждого раздела?"),
        ("user", "Да, составь шаблон для раздела по качеству портфеля"),
        ("assistant", "## Шаблон: Качество кредитного портфеля\n\n### 3.1 Показатели просроченной задолженности\n| Категория | Сумма (млн сум) | Доля в портфеле |\n|-----------|----------------|------------------|\n| Просрочка 1-30 дней | | |\n| Просрочка 31-90 дней | | |\n| NPL (>90 дней) | | |\n\n### 3.2 NPL Ratio\n- Текущий: ___%\n- Прогноз Q2: ___%\n- Benchmark по рынку: 4.2%\n\n### 3.3 Резервы\n- Созданные резервы: ___ млн сум\n- Покрытие NPL: ___%"),
    ]),
    ("Автоматизация HR процессов", [
        ("user", "Как AI может помочь автоматизировать процесс онбординга новых сотрудников?"),
        ("assistant", "Отличный вопрос! AI может значительно ускорить онбординг по нескольким направлениям:\n\n**🤖 Чат-бот для новичков**\nАвтоматически отвечает на типичные вопросы: где столовая, как оформить командировку, контакты HR.\n\n**📋 Автоматическая документация**\nAI генерирует персонализированный план адаптации на основе должности и отдела.\n\n**📚 Обучающий контент**\nАвтоматически подбирает курсы и материалы под роль сотрудника.\n\n**✅ Чек-листы**\nОтслеживает выполнение задач онбординга в реальном времени.\n\nПо данным McKinsey, автоматизация онбординга сокращает время адаптации на 30-40%. Хотите разработать план внедрения для Ipoteka Bank?"),
        ("user", "Да, сделай план внедрения на 3 месяца"),
        ("assistant", "## План внедрения AI-онбординга на 3 месяца\n\n### Месяц 1: Подготовка\n- Аудит текущего процесса онбординга\n- Сбор часто задаваемых вопросов (min. 100 вопросов)\n- Выбор платформы: ChatBot или интеграция с Telegram\n\n### Месяц 2: Разработка\n- Создание базы знаний из HR-документов\n- Настройка LLM с корпоративным контекстом\n- Разработка чек-листов по отделам\n- Пилот с 5-10 новыми сотрудниками\n\n### Месяц 3: Запуск\n- Полноценный запуск для всех новичков\n- Сбор обратной связи и оптимизация\n- KPI: время до продуктивности снизить с 30 до 20 дней"),
    ]),
    ("Риск-анализ заявки", [
        ("user", "Напиши промпт для анализа кредитного риска заёмщика"),
        ("assistant", "Вот эффективный промпт для анализа кредитного риска:\n\n```\nТы — кредитный аналитик Ipoteka Bank с 10-летним опытом. Проанализируй следующие данные заёмщика и дай оценку кредитного риска.\n\nДанные заёмщика:\n- Возраст: {age}\n- Ежемесячный доход: {income} сум\n- Стаж работы: {work_experience} лет\n- Текущие обязательства: {obligations} сум/месяц\n- Запрашиваемая сумма: {loan_amount} сум\n- Цель кредита: {purpose}\n\nПредоставь:\n1. Скоринговую оценку (0-100)\n2. Ключевые риск-факторы (топ-3)\n3. Рекомендацию: одобрить/отклонить/запросить дополнительные документы\n4. Предлагаемую процентную ставку\n```\n\nЭтот промпт структурирован по методологии CAMELS и учитывает стандарты ЦБ Узбекистана."),
    ]),
    ("Маркетинговая кампания", [
        ("user", "Придумай идеи для маркетинговой кампании по ипотечным продуктам"),
        ("assistant", "Вот 5 концепций кампании для ипотечных продуктов Ipoteka Bank:\n\n**1. «Дом мечты» — эмоциональный storytelling**\nРеальные истории клиентов, которые купили первое жильё. Видео-формат, соцсети.\n\n**2. «Калькулятор мечты» — digital-инструмент**\nИнтерактивный AI-калькулятор на сайте: введи зарплату → узнай, на какую квартиру можешь претендовать.\n\n**3. «Молодая семья» — сегментированная кампания**\nСпециальные условия для пар до 35 лет. Партнёрство с застройщиками.\n\n**4. Reels / TikTok — образовательный контент**\nСерия видео «Ипотека без страха»: мифы, расчёты, реальные примеры.\n\n**5. Реферальная программа**\nПриведи друга — оба получите снижение ставки на 0.5%.\n\nКакую концепцию хотите детализировать?"),
    ]),
    ("Оптимизация рабочих процессов", [
        ("user", "Как оптимизировать процесс согласования договоров в юридическом отделе?"),
        ("assistant", "Процесс согласования договоров можно ускорить в 2-3 раза с помощью следующих подходов:\n\n**Текущая проблема:** Среднее время согласования — 5-7 рабочих дней из-за последовательной цепочки согласований.\n\n**Решение 1: AI pre-screening**\nLLM автоматически проверяет договор на:\n- Соответствие стандартным шаблонам\n- Наличие обязательных клаузул\n- Нетипичные условия (флаг для юриста)\n\n**Решение 2: Параллельное согласование**\nВместо последовательной цепочки — одновременное согласование у всех участников.\n\n**Решение 3: Шаблоны с AI-заполнением**\nДля стандартных договоров — автозаполнение на основе данных из CRM.\n\n**Ожидаемый результат:** 5-7 дней → 1-2 дня. Экономия: ~200 часов в месяц для отдела."),
    ]),
]

SUGGESTIONS_DATA = [
    dict(title="Интеграция AI-чатбота в мобильное приложение", description="Добавить AI-ассистента в мобильное приложение банка для ответов на вопросы клиентов 24/7. Это снизит нагрузку на колл-центр на 30-40%.", department="it", impact="Снижение затрат на поддержку на 40%, улучшение NPS на 15 пунктов", status="implemented", coin_reward=25),
    dict(title="Автоматическая проверка документов через AI", description="Использовать OCR + LLM для автоматической проверки документов заёмщиков. Сократит время одобрения кредита с 2 дней до 2 часов.", department="operations", impact="Сокращение времени обработки на 75%, уменьшение ручного труда", status="approved", coin_reward=20),
    dict(title="AI-скоринг для микрокредитов", description="Разработать ML-модель скоринга на основе альтернативных данных (телефонная активность, соцсети) для клиентов без кредитной истории.", department="risk", impact="Расширение клиентской базы на 15%, снижение NPL на 2%", status="approved", coin_reward=15),
    dict(title="Дашборд предиктивной аналитики для менеджеров", description="Создать дашборд с AI-прогнозами: какие клиенты, скорее всего, возьмут следующий продукт.", department="sales", impact="Рост кросс-продаж на 25%", status="submitted", coin_reward=0),
    dict(title="Голосовой AI-помощник для операционистов", description="Голосовой ассистент для быстрого поиска информации о клиенте во время звонка.", department="operations", impact="Сокращение AHT на 30 секунд, улучшение качества обслуживания", status="submitted", coin_reward=0),
    dict(title="Автоматическое составление отчётов для ЦБ", description="LLM генерирует регуляторные отчёты на основе данных из БД. Экономит 20+ часов в месяц.", department="finance", impact="Экономия 240 часов в год, снижение ошибок на 90%", status="approved", coin_reward=18),
    dict(title="Персонализированные предложения через AI", description="Алгоритм рекомендаций продуктов на основе поведения клиента.", department="marketing", impact="Рост конверсии email-рассылок с 2% до 8%", status="submitted", coin_reward=0),
    dict(title="AI-мониторинг транзакций в реальном времени", description="Нейросеть для обнаружения мошеннических транзакций с точностью 98.5%.", department="risk", impact="Снижение потерь от мошенничества на 60%", status="implemented", coin_reward=25),
]


async def get_badge_ids(session: AsyncSession) -> dict[str, str]:
    result = await session.execute(text("SELECT name, id FROM badges"))
    return {row.name: row.id for row in result.all()}


async def seed_demo(session: AsyncSession) -> None:
    print("🚀 Demo seed başlandi...")

    # ─── 1. Get existing IDs ───────────────────────────────────────────────────
    admin_result = await session.execute(text("SELECT id FROM users WHERE email='admin@ipotekabank.uz'"))
    admin_row = admin_result.first()
    admin_id = admin_row.id if admin_row else None

    badge_ids = await get_badge_ids(session)
    marketplace_result = await session.execute(text("SELECT id, price FROM marketplace_items WHERE is_active=true"))
    marketplace_items = {row.id: row.price for row in marketplace_result.all()}
    marketplace_ids = list(marketplace_items.keys())

    week, year = get_current_week()

    # ─── 2. Create Employees ──────────────────────────────────────────────────
    created_users: list[tuple[str, dict]] = []

    for emp_data in EMPLOYEES:
        existing = await session.execute(
            text("SELECT id FROM users WHERE employee_id=:eid"),
            {"eid": emp_data["employee_id"]}
        )
        row = existing.first()
        if row:
            created_users.append((row.id, emp_data))
            continue

        user_id = uid()
        user = UserModel(
            id=user_id,
            employee_id=emp_data["employee_id"],
            email=emp_data["email"],
            password_hash=hash_password("demo123"),
            first_name=emp_data["first_name"],
            last_name=emp_data["last_name"],
            role=emp_data.get("role", UserRole.EMPLOYEE),
            department=emp_data["department"],
            position=emp_data["position"],
            is_active=True,
            last_login_at=days_ago(random.randint(0, 3)),
        )
        session.add(user)
        created_users.append((user_id, emp_data))

    await session.flush()
    print(f"  ✓ {len(created_users)} xodim yaratildi/topildi")

    # ─── 3. Coin balances + transactions ──────────────────────────────────────
    action_types = ["prompt", "quality_prompt", "game_reward", "suggestion", "weekly_streak"]
    descriptions_map = {
        "prompt": ["Запрос к AI по кредитному анализу", "Составление отчёта через AI", "Анализ данных с помощью AI", "Генерация текста для документа"],
        "quality_prompt": ["Высококачественный промпт по риск-анализу", "Отличный запрос по маркетингу", "Качественный анализ через AI"],
        "game_reward": ["Квиз по AI-технологиям", "Игра 'Детектив'", "Игра 'Fraud Detector'", "Игра 'Классификатор'", "Prompt Master"],
        "suggestion": ["Одобренная идея по оптимизации", "Принятое предложение по автоматизации"],
        "weekly_streak": ["Недельная серия активности", "Бонус за регулярное использование"],
    }

    for idx, (user_id, emp_data) in enumerate(created_users):
        profile = PROFILES[idx]
        earned, spent = profile[0], profile[1]

        # Check if balance exists
        bal_check = await session.execute(text("SELECT user_id FROM coin_balances WHERE user_id=:uid"), {"uid": user_id})
        if not bal_check.first():
            session.add(CoinBalanceModel(
                user_id=user_id,
                balance=earned - spent,
                total_earned=earned,
                total_spent=spent,
            ))

        # Transactions (last 30 days)
        tx_count = random.randint(8, 20)
        for _ in range(tx_count):
            action = random.choice(action_types)
            descs = descriptions_map[action]
            amount_map = {"prompt": (1, 3), "quality_prompt": (3, 10), "game_reward": (1, 5), "suggestion": (5, 25), "weekly_streak": (10, 10)}
            lo, hi = amount_map[action]
            amount = random.randint(lo, hi)
            created_at = days_ago(random.randint(0, 29))
            session.add(CoinTransactionModel(
                id=uid(),
                user_id=user_id,
                action_type=action,
                amount=amount,
                status="approved",
                description=random.choice(descs),
                quality_score=round(random.uniform(0.4, 1.0), 2),
                created_at=created_at,
                updated_at=created_at,
            ))

    await session.flush()
    print("  ✓ Coin balances + transactions yaratildi")

    # ─── 4. Ranking entries (current week) ────────────────────────────────────
    categories = ["ai_innovator", "best_optimizer", "ai_contributor", "silent_hero"]

    for cat_idx, category in enumerate(categories):
        # Collect all (user_id, score) for this category and sort
        scores: list[tuple[str, float]] = []
        for idx, (user_id, _) in enumerate(created_users):
            base_score = PROFILES[idx][2 + cat_idx]
            jitter = random.uniform(-5.0, 5.0)
            scores.append((user_id, max(0.0, base_score + jitter)))

        scores.sort(key=lambda x: x[1], reverse=True)

        for rank_pos, (user_id, score) in enumerate(scores, start=1):
            existing = await session.execute(
                text("SELECT id FROM ranking_entries WHERE user_id=:uid AND category=:cat AND week_number=:wk AND year=:yr"),
                {"uid": user_id, "cat": category, "wk": week, "yr": year}
            )
            if existing.first():
                continue
            session.add(RankingEntryModel(
                id=uid(),
                user_id=user_id,
                category=category,
                week_number=week,
                year=year,
                score=round(score, 1),
                rank=rank_pos,
            ))

    await session.flush()
    print("  ✓ Ranking entries yaratildi (joriy hafta)")

    # ─── 5. Badge awards ──────────────────────────────────────────────────────
    badge_awards = [
        # Top AI users get ai_innovator badges
        (0, "first_prompt"),   # IT001
        (0, "prompt_master_100"),
        (5, "first_prompt"),   # SAL001
        (5, "prompt_master_100"),
        (1, "first_prompt"),   # IT002
        (3, "first_prompt"),   # FIN001
        (3, "quality_writer"),
        (6, "first_prompt"),   # SAL002
        (6, "top3_weekly"),
        (0, "top3_weekly"),
        (5, "top3_weekly"),
        # Contributors
        (0, "tool_creator"),   # IT001 created a tool
        (2, "tool_creator"),   # IT003
        # Suggestions
        (10, "idea_generator"), # OPS001 has many suggestions
        (5, "idea_generator"),  # SAL001
        # Customer service
        (5, "smile_master"),   # SAL001
        (6, "problem_solver"), # SAL002
        (7, "fast_helper"),    # SAL003
        # New employees
        (18, "first_prompt"),   # Gulnoza Lutfullaeva
        (18, "quality_writer"),
        (19, "first_prompt"),   # Shakhzoda Bendik
        (19, "prompt_master_100"),
        (19, "top3_weekly"),
        (19, "smile_master"),
        (20, "first_prompt"),   # Shakhnoza Umarova
        (20, "quality_writer"),
        (21, "first_prompt"),   # Yevgenia Babaeva
        (21, "top3_weekly"),
        (21, "idea_generator"),
    ]

    for emp_idx, badge_name in badge_awards:
        if emp_idx >= len(created_users):
            continue
        user_id = created_users[emp_idx][0]
        badge_id = badge_ids.get(badge_name)
        if not badge_id:
            continue
        existing = await session.execute(
            text("SELECT id FROM user_badges WHERE user_id=:uid AND badge_id=:bid"),
            {"uid": user_id, "bid": badge_id}
        )
        if existing.first():
            continue
        earned_at = days_ago(random.randint(1, 14))
        session.add(UserBadgeModel(
            id=uid(), user_id=user_id, badge_id=badge_id, earned_at=earned_at
        ))

    await session.flush()
    print("  ✓ Badge awards yaratildi")

    # ─── 6. Suggestions ───────────────────────────────────────────────────────
    suggestion_authors = [0, 10, 3, 6, 10, 3, 14, 12, 19, 21, 18, 20]  # employee index

    for i, sug_data in enumerate(SUGGESTIONS_DATA):
        emp_idx = suggestion_authors[i % len(suggestion_authors)]
        author_id = created_users[emp_idx][0]

        existing = await session.execute(
            text("SELECT id FROM suggestions WHERE title=:t"), {"t": sug_data["title"]}
        )
        if existing.first():
            continue

        reviewed_by = admin_id if sug_data["status"] in ("approved", "implemented") else None
        created_at = days_ago(random.randint(3, 25))
        session.add(SuggestionModel(
            id=uid(),
            user_id=author_id,
            title=sug_data["title"],
            description=sug_data["description"],
            department=sug_data["department"],
            impact=sug_data["impact"],
            status=sug_data["status"],
            coin_reward=sug_data["coin_reward"],
            reviewed_by=reviewed_by,
            created_at=created_at,
            updated_at=created_at,
        ))

    await session.flush()
    print("  ✓ Suggestions yaratildi")

    # ─── 7. Marketplace purchases ─────────────────────────────────────────────
    if marketplace_ids:
        purchasers = [5, 0, 3, 6, 1]  # top spenders
        for emp_idx in purchasers:
            user_id = created_users[emp_idx][0]
            item_id = random.choice(marketplace_ids)
            price = marketplace_items[item_id]

            existing = await session.execute(
                text("SELECT id FROM purchases WHERE user_id=:uid AND item_id=:iid"),
                {"uid": user_id, "iid": item_id}
            )
            if existing.first():
                continue

            created_at = days_ago(random.randint(1, 10))
            session.add(PurchaseModel(
                id=uid(),
                user_id=user_id,
                item_id=item_id,
                coins_cost=price,
                status="fulfilled",
                fulfilled_by=admin_id,
                created_at=created_at,
                updated_at=created_at,
            ))

    await session.flush()
    print("  ✓ Marketplace purchases yaratildi")

    # ─── 8. Chat sessions + messages ──────────────────────────────────────────
    chat_users = [0, 3, 5, 10, 12, 18, 19, 20, 21]  # employees who chat frequently
    models_list = ["qwen2.5:7b", "qwen2.5:14b"]

    for chat_idx, emp_idx in enumerate(chat_users):
        user_id = created_users[emp_idx][0]
        topic_data = CHAT_TOPICS[chat_idx % len(CHAT_TOPICS)]
        title, messages = topic_data

        existing = await session.execute(
            text("SELECT id FROM chat_sessions WHERE user_id=:uid AND title=:t"),
            {"uid": user_id, "t": title}
        )
        if existing.first():
            continue

        session_id = uid()
        created_at = days_ago(random.randint(0, 7))
        session.add(ChatSessionModel(
            id=session_id,
            user_id=user_id,
            title=title,
            model=random.choice(models_list),
            agent_mode="simple_chat",
            is_active=True,
            created_at=created_at,
            updated_at=created_at,
        ))
        await session.flush()

        for msg_offset, (role, content) in enumerate(messages):
            msg_time = created_at + timedelta(minutes=msg_offset * 2)
            session.add(ChatMessageModel(
                id=uid(),
                session_id=session_id,
                role=role,
                content=content,
                token_count=len(content.split()),
                latency_ms=random.randint(200, 1500) if role == "assistant" else 0,
                created_at=msg_time,
            ))

    await session.flush()
    print("  ✓ Chat sessions + messages yaratildi")

    # ─── 9. Notifications ─────────────────────────────────────────────────────
    notif_templates = [
        ("coin_awarded", "Вы заработали монеты! 💰", "Начислено {n} IB-монет за активность с AI-ассистентом."),
        ("badge_earned", "Новый значок получен! 🏅", "Вы получили значок «Первый запрос». Продолжайте в том же духе!"),
        ("suggestion_reviewed", "Ваше предложение рассмотрено", "Ваша идея по автоматизации одобрена. Ждите начисления монет."),
        ("ranking_update", "Вы поднялись в рейтинге! 📈", "Поздравляем! Вы вошли в топ-5 рейтинга AI Инноваторов этой недели."),
    ]

    for emp_idx in list(range(min(8, len(created_users)))) + [18, 19, 20, 21]:
        user_id = created_users[emp_idx][0]
        notif_type, title_tpl, msg_tpl = random.choice(notif_templates)
        n = random.randint(3, 15)
        created_at = days_ago(random.randint(0, 5))
        session.add(NotificationModel(
            id=uid(),
            user_id=user_id,
            type=notif_type,
            title=title_tpl,
            message=msg_tpl.format(n=n),
            is_read=random.choice([True, False]),
            created_at=created_at,
            updated_at=created_at,
        ))

    await session.flush()
    print("  ✓ Notifications yaratildi")

    await session.commit()
    print("\n✅ Demo seed muvaffaqiyatli yakunlandi!")
    print(f"   Xodimlar: {len(created_users)}")
    print(f"   Ranking: hafta {week}/{year} — 4 kategoriya")
    print(f"   Takliflar: {len(SUGGESTIONS_DATA)}")
    print(f"   Chat sessiyalar: {len(chat_users)}")
    print("\n   Demo login: aziz.karimov@ipotekabank.uz / demo123")
    print("   New users:  gulnoza.lutfullaeva@ipotekabank.uz / demo123")
    print("               shakhzoda.bendik@ipotekabank.uz / demo123")
    print("               shakhnoza.umarova@ipotekabank.uz / demo123")
    print("               yevgenia.babaeva@ipotekabank.uz / demo123")


async def main() -> None:
    async with async_session_factory() as session:
        await seed_demo(session)


if __name__ == "__main__":
    asyncio.run(main())
