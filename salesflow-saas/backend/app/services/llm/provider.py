"""
LLM Provider Abstraction Layer
Supports Groq (primary) and OpenAI (fallback) with automatic failover.
"""

import time
import json
import logging
from typing import Optional, AsyncGenerator
from abc import ABC, abstractmethod

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger("dealix.llm")


class LLMResponse:
    """Standardized LLM response across providers."""
    def __init__(self, content: str, tokens_used: int = 0, latency_ms: int = 0,
                 provider: str = "", model: str = "", raw: dict = None):
        self.content = content
        self.tokens_used = tokens_used
        self.latency_ms = latency_ms
        self.provider = provider
        self.model = model
        self.raw = raw or {}

    def to_dict(self) -> dict:
        return {
            "content": self.content,
            "tokens_used": self.tokens_used,
            "latency_ms": self.latency_ms,
            "provider": self.provider,
            "model": self.model,
        }

    def parse_json(self) -> Optional[dict]:
        """Try to parse content as JSON."""
        try:
            # Handle markdown code blocks
            text = self.content.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            return json.loads(text.strip())
        except (json.JSONDecodeError, ValueError):
            return None


class BaseLLMProvider(ABC):
    """Abstract base for LLM providers."""

    @abstractmethod
    async def complete(self, system_prompt: str, user_message: str,
                       temperature: float = None, max_tokens: int = None,
                       json_mode: bool = False) -> LLMResponse:
        pass

    @abstractmethod
    async def is_available(self) -> bool:
        pass


class GroqProvider(BaseLLMProvider):
    """Groq API provider — ultra-fast inference."""

    def __init__(self):
        from groq import AsyncGroq
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None
        self.model = settings.GROQ_MODEL
        self.fast_model = settings.GROQ_FAST_MODEL

    async def is_available(self) -> bool:
        return bool(settings.GROQ_API_KEY and self.client)

    async def complete(self, system_prompt: str, user_message: str,
                       temperature: float = None, max_tokens: int = None,
                       json_mode: bool = False, fast: bool = False) -> LLMResponse:
        if not self.client:
            raise RuntimeError("Groq API key not configured")

        model = self.fast_model if fast else self.model
        start = time.time()

        kwargs = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": temperature or settings.LLM_TEMPERATURE,
            "max_tokens": max_tokens or settings.LLM_MAX_TOKENS,
        }

        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        response = await self.client.chat.completions.create(**kwargs)
        latency = int((time.time() - start) * 1000)

        return LLMResponse(
            content=response.choices[0].message.content or "",
            tokens_used=response.usage.total_tokens if response.usage else 0,
            latency_ms=latency,
            provider="groq",
            model=model,
            raw=response.model_dump() if hasattr(response, "model_dump") else {},
        )


class OpenAIProvider(BaseLLMProvider):
    """OpenAI API provider — highest quality, fallback."""

    def __init__(self):
        from openai import AsyncOpenAI
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        self.model = settings.OPENAI_MODEL
        self.mini_model = settings.OPENAI_MINI_MODEL

    async def is_available(self) -> bool:
        return bool(settings.OPENAI_API_KEY and self.client)

    async def complete(self, system_prompt: str, user_message: str,
                       temperature: float = None, max_tokens: int = None,
                       json_mode: bool = False, mini: bool = False) -> LLMResponse:
        if not self.client:
            raise RuntimeError("OpenAI API key not configured")

        model = self.mini_model if mini else self.model
        start = time.time()

        kwargs = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": temperature or settings.LLM_TEMPERATURE,
            "max_tokens": max_tokens or settings.LLM_MAX_TOKENS,
        }

        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        response = await self.client.chat.completions.create(**kwargs)
        latency = int((time.time() - start) * 1000)

        return LLMResponse(
            content=response.choices[0].message.content or "",
            tokens_used=response.usage.total_tokens if response.usage else 0,
            latency_ms=latency,
            provider="openai",
            model=model,
            raw=response.model_dump() if hasattr(response, "model_dump") else {},
        )


class LLMRouter:
    """
    Intelligent LLM routing with automatic failover.
    Primary: Groq (fast, free/cheap)
    Fallback: OpenAI (reliable, high quality)
    """

    def __init__(self):
        self.groq = GroqProvider()
        self.openai = OpenAIProvider()
        self._primary = settings.LLM_PRIMARY_PROVIDER

    async def complete(self, system_prompt: str, user_message: str,
                       temperature: float = None, max_tokens: int = None,
                       json_mode: bool = False, provider: str = None,
                       fast: bool = False) -> LLMResponse:
        """
        Send a completion request to the best available provider.

        Args:
            system_prompt: System instructions
            user_message: User input
            temperature: Override default temperature
            max_tokens: Override default max tokens
            json_mode: Request JSON output
            provider: Force specific provider ("groq" or "openai")
            fast: Use faster/smaller model variant
        """
        # Determine provider order
        if provider == "openai":
            providers = [("openai", self.openai)]
        elif provider == "groq":
            providers = [("groq", self.groq)]
        elif self._primary == "groq":
            providers = [("groq", self.groq), ("openai", self.openai)]
        else:
            providers = [("openai", self.openai), ("groq", self.groq)]

        last_error = None
        for name, prov in providers:
            if not await prov.is_available():
                logger.warning(f"LLM provider {name} not available, trying next...")
                continue
            try:
                kwargs = {
                    "system_prompt": system_prompt,
                    "user_message": user_message,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "json_mode": json_mode,
                }
                if name == "groq":
                    kwargs["fast"] = fast
                elif name == "openai":
                    kwargs["mini"] = fast

                result = await prov.complete(**kwargs)
                logger.info(
                    f"LLM call: provider={name} model={result.model} "
                    f"tokens={result.tokens_used} latency={result.latency_ms}ms"
                )
                return result
            except Exception as e:
                last_error = e
                logger.warning(f"LLM provider {name} failed: {e}, trying next...")
                continue

        raise RuntimeError(f"All LLM providers failed. Last error: {last_error}")

    async def complete_json(self, system_prompt: str, user_message: str,
                            **kwargs) -> dict:
        """Shortcut: complete and parse as JSON."""
        response = await self.complete(system_prompt, user_message,
                                       json_mode=True, **kwargs)
        parsed = response.parse_json()
        if parsed is None:
            raise ValueError(f"Failed to parse LLM response as JSON: {response.content[:200]}")
        return parsed


# Singleton
_router: Optional[LLMRouter] = None

def get_llm() -> LLMRouter:
    global _router
    if _router is None:
        _router = LLMRouter()
    return _router
