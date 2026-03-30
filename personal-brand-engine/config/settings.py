"""Central configuration loaded from .env and YAML files."""

from __future__ import annotations

import os
from pathlib import Path
from functools import lru_cache

import yaml
from pydantic_settings import BaseSettings
from pydantic import Field


BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = BASE_DIR / "config"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # LLM - Ollama
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen2.5:7b"

    # LLM - Groq
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-70b-versatile"

    # LLM - OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # LinkedIn
    linkedin_email: str = ""
    linkedin_password: str = ""

    # Twitter/X
    twitter_api_key: str = ""
    twitter_api_secret: str = ""
    twitter_access_token: str = ""
    twitter_access_secret: str = ""
    twitter_bearer_token: str = ""

    # Email
    imap_host: str = "imap.gmail.com"
    imap_port: int = 993
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    email_address: str = ""
    email_password: str = ""

    # WhatsApp - Meta Cloud API
    whatsapp_api_token: str = ""
    whatsapp_phone_number_id: str = ""
    whatsapp_verify_token: str = "your-webhook-verify-token"

    # WhatsApp - Twilio
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_whatsapp_number: str = ""

    # Cal.com
    calcom_api_key: str = ""
    calcom_booking_url: str = ""

    # Notifications
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""

    # Database
    database_url: str = "sqlite:///./data/brand_engine.db"

    # Server
    api_host: str = "0.0.0.0"
    api_port: int = 8080
    api_secret_key: str = "change-this-to-a-random-secret"

    # General
    timezone: str = "Asia/Riyadh"
    default_language: str = "ar"
    log_level: str = "INFO"

    model_config = {"env_file": str(BASE_DIR / ".env"), "env_file_encoding": "utf-8"}


def load_yaml(filename: str) -> dict:
    """Load a YAML config file from the config directory."""
    filepath = CONFIG_DIR / filename
    if not filepath.exists():
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


@lru_cache
def get_settings() -> Settings:
    return Settings()


def get_brand_profile() -> dict:
    return load_yaml("brand_profile.yaml")


def get_schedule_config() -> dict:
    return load_yaml("schedule.yaml")


def get_content_strategy() -> dict:
    return load_yaml("content_strategy.yaml")
