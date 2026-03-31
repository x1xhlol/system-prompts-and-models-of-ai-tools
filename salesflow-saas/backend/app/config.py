from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Dealix"
    APP_NAME_AR: str = "ديل اي اكس"
    DEBUG: bool = False
    DEFAULT_TIMEZONE: str = "Asia/Riyadh"
    DEFAULT_CURRENCY: str = "SAR"
    DEFAULT_LOCALE: str = "ar"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://salesflow:salesflow_secret_2024@db:5432/salesflow"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # Security
    SECRET_KEY: str = "change-this-to-a-random-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # URLs
    API_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"

    # WhatsApp
    WHATSAPP_API_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_BUSINESS_ACCOUNT_ID: str = ""
    WHATSAPP_VERIFY_TOKEN: str = ""

    # Email
    EMAIL_PROVIDER: str = "smtp"
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SENDGRID_API_KEY: str = ""

    # SMS (Unifonic)
    UNIFONIC_APP_SID: str = ""
    UNIFONIC_SENDER_ID: str = "Dealix"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
