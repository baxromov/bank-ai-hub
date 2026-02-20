"""Celery application configuration.

Run worker:
    celery -A src.celery_app worker --loglevel=info

Run beat (scheduler):
    celery -A src.celery_app beat --loglevel=info
"""

from celery import Celery
from celery.schedules import crontab

from src.config import settings

celery = Celery(
    "ibhub",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.REDIS_URL,
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Tashkent",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

# Periodic tasks
celery.conf.beat_schedule = {
    "calculate-weekly-rankings": {
        "task": "src.ranking.tasks.calculate_weekly_rankings",
        "schedule": crontab(
            hour=0, minute=0, day_of_week="monday"
        ),  # Every Monday at midnight
    },
    "check-badges": {
        "task": "src.ranking.tasks.check_all_badges",
        "schedule": crontab(hour=1, minute=0),  # Daily at 1 AM
    },
}

# Auto-discover tasks in each bounded context
celery.autodiscover_tasks([
    "src.ranking",
    "src.coin_economy",
])
