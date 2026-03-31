"""
LLM Provider — Unified interface for OpenAI, Groq, and Ollama.
Handles failover, caching, rate limiting, and token tracking.
"""

import asyncio
import hashlib
import json
import time
from typing import Optional

import httpx
from openai import AsyncOpenAI

from app.config import get_settings

settings = get_settings()


class LLMProvider:
    """
    Unified LLM gateway supporting multiple providers with automatic failover.

    Usage:
        llm = LLMProvider()
        response = await llm.chat("You are a sales agent.", "Hello, tell me about your services.")
        embedding = await llm.embed("Some text to vectorize")
    """

    def __init__(self):
        self._openai = None
        self._groq = None
        self._cache = {}
        self._token_usage = {"prompt": 0, "completion": 0, "total": 0}
        self._request_count = 0
        self._last_request_time = 0

    # ── Properties ────────────────────────────────

    @property
    def openai_client(self) -> AsyncOpenAI:
        if not self._openai and settings.OPENAI_API_KEY:
            self._openai = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._openai

    @property
    def groq_client(self) -> AsyncOpenAI:
        if not self._groq and settings.GROQ_API_KEY:
            self._groq = AsyncOpenAI(
                api_key=settings.GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1",
            )
        return self._groq

    # ── Main Chat Interface ───────────────────────

    async def chat(
        self,
        system_prompt: str,
        user_message: str,
        model: str = None,
        provider: str = None,
        temperature: float = None,
        max_tokens: int = None,
        json_mode: bool = False,
        history: list = None,
    ) -> dict:
        """
        Send a chat completion request with automatic failover.

        Returns:
            {
                "content": "The AI response text",
                "provider": "openai",
                "model": "gpt-4o",
                "tokens": {"prompt": 100, "completion": 50, "total": 150},
                "latency_ms": 1234,
                "cached": False
            }
        """
        # Check cache
        if settings.LLM_CACHE_ENABLED:
            cache_key = self._cache_key(system_prompt, user_message, model)
            cached = self._get_cached(cache_key)
            if cached:
                return {**cached, "cached": True}

        # Rate limiting
        await self._rate_limit()

        # Build messages
        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": user_message})

        # Try primary provider, then fallback
        primary = provider or settings.LLM_PRIMARY_PROVIDER
        fallback = settings.LLM_FALLBACK_PROVIDER

        for attempt_provider in [primary, fallback]:
            try:
                result = await self._call_provider(
                    provider=attempt_provider,
                    messages=messages,
                    model=model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    json_mode=json_mode,
                )

                # Cache result
                if settings.LLM_CACHE_ENABLED:
                    self._set_cached(cache_key, result)

                return result

            except Exception as e:
                if attempt_provider == fallback:
                    # Both failed, try Ollama as last resort
                    try:
                        return await self._call_ollama(messages, temperature, max_tokens)
                    except Exception:
                        raise RuntimeError(
                            f"All LLM providers failed. Last error: {str(e)}"
                        )

    # ── Embedding ─────────────────────────────────

    async def embed(self, text: str, model: str = None) -> list:
        """Generate embeddings using OpenAI's embedding model."""
        if not self.openai_client:
            raise RuntimeError("OpenAI API key not configured for embeddings")

        response = await self.openai_client.embeddings.create(
            model=model or settings.OPENAI_EMBEDDING_MODEL,
            input=text,
        )
        return response.data[0].embedding

    async def embed_batch(self, texts: list, model: str = None) -> list:
        """Generate embeddings for multiple texts."""
        if not self.openai_client:
            raise RuntimeError("OpenAI API key not configured for embeddings")

        response = await self.openai_client.embeddings.create(
            model=model or settings.OPENAI_EMBEDDING_MODEL,
            input=texts,
        )
        return [item.embedding for item in response.data]

    # ── Provider Implementations ──────────────────

    async def _call_provider(
        self,
        provider: str,
        messages: list,
        model: str = None,
        temperature: float = None,
        max_tokens: int = None,
        json_mode: bool = False,
    ) -> dict:
        start = time.time()

        if provider == "openai":
            client = self.openai_client
            model = model or settings.OPENAI_MODEL
            temp = temperature if temperature is not None else settings.OPENAI_TEMPERATURE
            tokens = max_tokens or settings.OPENAI_MAX_TOKENS
        elif provider == "groq":
            client = self.groq_client
            model = model or settings.GROQ_MODEL
            temp = temperature if temperature is not None else 0.7
            tokens = max_tokens or settings.GROQ_MAX_TOKENS
        else:
            return await self._call_ollama(messages, temperature, max_tokens)

        if not client:
            raise RuntimeError(f"Provider {provider} not configured")

        kwargs = {
            "model": model,
            "messages": messages,
            "temperature": temp,
            "max_tokens": tokens,
        }

        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        response = await client.chat.completions.create(**kwargs)
        latency = int((time.time() - start) * 1000)

        usage = response.usage
        self._token_usage["prompt"] += usage.prompt_tokens
        self._token_usage["completion"] += usage.completion_tokens
        self._token_usage["total"] += usage.total_tokens
        self._request_count += 1

        return {
            "content": response.choices[0].message.content,
            "provider": provider,
            "model": model,
            "tokens": {
                "prompt": usage.prompt_tokens,
                "completion": usage.completion_tokens,
                "total": usage.total_tokens,
            },
            "latency_ms": latency,
            "cached": False,
        }

    async def _call_ollama(
        self,
        messages: list,
        temperature: float = None,
        max_tokens: int = None,
    ) -> dict:
        start = time.time()
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": temperature or 0.7,
                        "num_predict": max_tokens or 2048,
                    },
                },
            )
            response.raise_for_status()
            data = response.json()

        latency = int((time.time() - start) * 1000)
        return {
            "content": data.get("message", {}).get("content", ""),
            "provider": "ollama",
            "model": settings.OLLAMA_MODEL,
            "tokens": {
                "prompt": data.get("prompt_eval_count", 0),
                "completion": data.get("eval_count", 0),
                "total": data.get("prompt_eval_count", 0) + data.get("eval_count", 0),
            },
            "latency_ms": latency,
            "cached": False,
        }

    # ── Rate Limiting ─────────────────────────────

    async def _rate_limit(self):
        now = time.time()
        if now - self._last_request_time < 60 / settings.LLM_RATE_LIMIT_RPM:
            await asyncio.sleep(60 / settings.LLM_RATE_LIMIT_RPM)
        self._last_request_time = time.time()

    # ── Caching ───────────────────────────────────

    @staticmethod
    def _cache_key(system: str, user: str, model: str = None) -> str:
        raw = f"{system}:{user}:{model or ''}"
        return hashlib.sha256(raw.encode()).hexdigest()

    def _get_cached(self, key: str) -> Optional[dict]:
        if key in self._cache:
            entry = self._cache[key]
            if time.time() - entry["time"] < settings.LLM_CACHE_TTL:
                return entry["data"]
            del self._cache[key]
        return None

    def _set_cached(self, key: str, data: dict):
        self._cache[key] = {"data": data, "time": time.time()}
        # Evict old entries
        if len(self._cache) > 1000:
            oldest = sorted(self._cache.items(), key=lambda x: x[1]["time"])
            for k, _ in oldest[:100]:
                del self._cache[k]

    # ── Stats ─────────────────────────────────────

    def get_usage_stats(self) -> dict:
        return {
            "token_usage": self._token_usage.copy(),
            "request_count": self._request_count,
            "cache_entries": len(self._cache),
        }
