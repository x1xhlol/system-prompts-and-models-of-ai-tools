"""Tests for configuration loading."""

import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


def test_settings_defaults():
    """Settings should load with defaults even without .env."""
    from config.settings import Settings
    s = Settings()
    assert s.timezone == "Asia/Riyadh"
    assert s.default_language == "ar"
    assert s.api_port == 8080
    assert s.imap_host == "imap.gmail.com"


def test_brand_profile_loads():
    """brand_profile.yaml should load and contain Sami's data."""
    from config.settings import get_brand_profile
    profile = get_brand_profile()
    assert profile is not None
    assert "personal" in profile
    assert profile["personal"]["name_en"] == "Sami Mohammed Assiri"
    assert profile["personal"]["email"] == "sami.assiri11@gmail.com"


def test_schedule_config_loads():
    """schedule.yaml should load all 7 agents."""
    from config.settings import get_schedule_config
    schedule = get_schedule_config()
    assert "agents" in schedule
    agents = schedule["agents"]
    assert "linkedin" in agents
    assert "email" in agents
    assert "social_media" in agents
    assert "whatsapp" in agents
    assert "cv_optimizer" in agents
    assert "content_strategist" in agents
    assert "opportunity_scout" in agents


def test_content_strategy_loads():
    """content_strategy.yaml should load with pillars."""
    from config.settings import get_content_strategy
    strategy = get_content_strategy()
    assert "content_pillars" in strategy
    assert len(strategy["content_pillars"]) >= 4


def test_yaml_load_missing_file():
    """Loading a missing YAML file should return empty dict."""
    from config.settings import load_yaml
    result = load_yaml("nonexistent.yaml")
    assert result == {}
