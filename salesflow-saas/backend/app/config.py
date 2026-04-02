from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────
    APP_NAME: str = "Dealix"
    APP_NAME_AR: str = "ديل اي اكس"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    DEFAULT_TIMEZONE: str = "Asia/Riyadh"
    DEFAULT_CURRENCY: str = "SAR"
    DEFAULT_LOCALE: str = "ar"
    AGENT_PROMPTS_DIR: str = "app/ai/prompts"

    # ── Database ─────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://salesflow:salesflow_secret_2024@localhost:5432/salesflow"

    # ── Redis ────────────────────────────────────────────
    REDIS_URL: str = "redis://redis:6379/0"

    # ── Security ─────────────────────────────────────────
    SECRET_KEY: str = "change-this-to-a-random-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── URLs ─────────────────────────────────────────────
    API_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"

    # ── LLM Providers ────────────────────────────────────
    # Primary: Groq (free/cheap, very fast)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_FAST_MODEL: str = "llama-3.1-8b-instant"

    # Fallback: OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_MINI_MODEL: str = "gpt-4o-mini"

    # Embeddings
    EMBEDDING_PROVIDER: str = "openai"  # openai, sentence-transformers
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSIONS: int = 1536

    # LLM defaults
    LLM_PRIMARY_PROVIDER: str = "groq"  # groq, openai
    LLM_FALLBACK_PROVIDER: str = "groq"
    LLM_TEMPERATURE: float = 0.3
    LLM_MAX_TOKENS: int = 2048
    LLM_TIMEOUT: int = 30

    # ── WhatsApp Business API ────────────────────────────
    WHATSAPP_API_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_BUSINESS_ACCOUNT_ID: str = ""
    WHATSAPP_VERIFY_TOKEN: str = ""
    WHATSAPP_API_URL: str = "https://graph.facebook.com/v21.0"
    WHATSAPP_MOCK_MODE: bool = True  # Use mock for development

    # ── Email ────────────────────────────────────────────
    EMAIL_PROVIDER: str = "smtp"  # smtp, sendgrid
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SENDGRID_API_KEY: str = ""
    EMAIL_FROM_NAME: str = "Dealix"
    EMAIL_FROM_ADDRESS: str = "noreply@dealix.sa"

    # ── SMS (Unifonic - Saudi) ───────────────────────────
    UNIFONIC_APP_SID: str = ""
    UNIFONIC_SENDER_ID: str = "Dealix"

    # ── Calendar Integration ─────────────────────────────
    GOOGLE_CALENDAR_CREDENTIALS: str = ""
    GOOGLE_CALENDAR_ID: str = ""
    MICROSOFT_CLIENT_ID: str = ""
    MICROSOFT_CLIENT_SECRET: str = ""

    # ── CRM Connectors ───────────────────────────────────
    HUBSPOT_API_KEY: str = ""
    SALESFORCE_CLIENT_ID: str = ""
    SALESFORCE_CLIENT_SECRET: str = ""
    SALESFORCE_DOMAIN: str = ""

    # ── Scraping / Lead Gen ──────────────────────────────
    GOOGLE_MAPS_API_KEY: str = ""
    RAPIDAPI_KEY: str = ""  # For LinkedIn data enrichment

    # ── Rate Limiting ────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    WHATSAPP_RATE_LIMIT_PER_SECOND: int = 80

    # ── Celery ───────────────────────────────────────────
    CELERY_BROKER_URL: str = "redis://redis:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/2"

    # ── File Storage ─────────────────────────────────────
    UPLOAD_DIR: str = "/app/uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
