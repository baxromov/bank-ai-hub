from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    APP_NAME: str = "BankAI Hub"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://ibhub:ibhub_secret@localhost:5432/ibhub"
    DATABASE_URL_SYNC: str = "postgresql://ibhub:ibhub_secret@localhost:5432/ibhub"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Ollama
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_DEFAULT_MODEL: str = "qwen2.5:7b"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()
