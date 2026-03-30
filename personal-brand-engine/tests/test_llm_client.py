"""Tests for LLM client."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


def test_llm_client_init():
    """LLM client should initialize with defaults."""
    from llm.client import LLMClient
    client = LLMClient()
    assert client.ollama_model == "qwen2.5:7b"
    assert client.groq_model == "llama-3.1-70b-versatile"
    assert client.openai_model == "gpt-4o-mini"


def test_llm_response_dataclass():
    """LLMResponse should hold data correctly."""
    from llm.client import LLMResponse
    resp = LLMResponse(text="Hello", model="test", provider="ollama", tokens_used=10)
    assert resp.text == "Hello"
    assert resp.provider == "ollama"
    assert resp.tokens_used == 10


def test_rate_limiter():
    """Rate limiter should track and enforce limits."""
    from utils.rate_limiter import RateLimiter
    rl = RateLimiter()
    # LinkedIn default is 50/day
    assert rl.remaining("linkedin") == 50
    assert rl.allow("linkedin") is True
    assert rl.remaining("linkedin") == 49
