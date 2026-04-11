from pydantic_settings import BaseSettings, SettingsConfigDict
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
    # Comma-separated extra CORS origins (e.g. https://staging.example.com)
    CORS_EXTRA_ORIGINS: str = ""
    # When False and ENVIRONMENT=production, OpenAPI docs are disabled
    EXPOSE_OPENAPI: bool = True
    # If non-empty, require Authorization: Bearer <token> for /api/v1 (except health, webhooks, marketing, strategy, value-proposition)
    DEALIX_INTERNAL_API_TOKEN: str = ""
    # Serve sales_assets + sector presentations at /dealix-marketing, /dealix-presentations
    MARKETING_STATIC_ENABLED: bool = True
    # Empty = auto (repo/salesflow-saas). In Docker set to /salesflow (see docker-compose).
    MARKETING_STATIC_ROOT: str = ""

    # ── LLM Providers ────────────────────────────────────
    # Primary: Groq (free/cheap, very fast)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_FAST_MODEL: str = "llama-3.1-8b-instant"

    # Fallback: OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_MINI_MODEL: str = "gpt-4o-mini"

    # Additional LLM backends (read by model_router / agents via Settings or os.environ)
    ANTHROPIC_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""
    ZAI_API_KEY: str = ""  # Z.ai / GLM
    GOOGLE_API_KEY: str = ""  # Gemini (same name as lead_prospector)

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
    SALESFORCE_API_VERSION: str = "v60.0"
    SALESFORCE_REFRESH_TOKEN: str = ""
    SALESFORCE_ACCESS_TOKEN: str = ""

    # ── Stripe / Billing ────────────────────────────────────
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # ── E-Sign Providers ────────────────────────────────────
    DOCUSIGN_API_URL: str = "https://demo.docusign.net/restapi"
    DOCUSIGN_ACCESS_TOKEN: str = ""
    ADOBE_SIGN_API_URL: str = "https://api.na1.adobesign.com/api/rest/v6"
    ADOBE_SIGN_ACCESS_TOKEN: str = ""

    # ── Voice Agent Providers ───────────────────────────────
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""
    VOICE_PROVIDER: str = "twilio"

    # ── Autonomous Loops ────────────────────────────────────
    SELF_IMPROVEMENT_INTERVAL_SECONDS: int = 900
    OPENCLAW_SAFE_CORE_ENABLED: bool = True
    OPENCLAW_MEDIA_DRAFTS_ENABLED: bool = True
    OPENCLAW_MEMORY_ENABLED: bool = True
    OPENCLAW_CANARY_TENANTS: str = ""
    OPENCLAW_CANARY_ENFORCE_AUTO_ACTIONS: bool = True
    OPENCLAW_APPROVAL_SLA_HOURS_WARN: int = 4
    OPENCLAW_APPROVAL_SLA_HOURS_BREACH: int = 24
    # Escalation level 3 when age >= breach * multiplier (must be > 1)
    OPENCLAW_APPROVAL_ESCALATION_L3_MULTIPLIER: float = 2.0
    # Breach notifications (empty URLs = no outbound calls)
    OPENCLAW_SLA_ALERTS_ENABLED: bool = True
    OPENCLAW_SLA_WEBHOOK_URL: str = ""
    OPENCLAW_SLA_SLACK_WEBHOOK_URL: str = ""
    OPENCLAW_SLA_ALERT_COOLDOWN_MINUTES: int = 45

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

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="allow")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
