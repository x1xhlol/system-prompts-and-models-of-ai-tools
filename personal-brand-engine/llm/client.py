"""Unified LLM client with Ollama -> Groq -> OpenAI fallback chain."""

from __future__ import annotations

import logging
from dataclasses import dataclass

import httpx

logger = logging.getLogger(__name__)


@dataclass
class LLMResponse:
    text: str
    model: str
    provider: str
    tokens_used: int = 0


class LLMClient:
    """Unified LLM client that tries providers in order: Ollama -> Groq -> OpenAI."""

    def __init__(
        self,
        ollama_base_url: str = "http://localhost:11434",
        ollama_model: str = "qwen2.5:7b",
        groq_api_key: str = "",
        groq_model: str = "llama-3.1-70b-versatile",
        openai_api_key: str = "",
        openai_model: str = "gpt-4o-mini",
    ):
        self.ollama_base_url = ollama_base_url.rstrip("/")
        self.ollama_model = ollama_model
        self.groq_api_key = groq_api_key
        self.groq_model = groq_model
        self.openai_api_key = openai_api_key
        self.openai_model = openai_model
        self._http = httpx.AsyncClient(timeout=120.0)

    async def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> LLMResponse:
        """Generate text using the first available provider."""
        errors = []

        # Try Ollama first (free, local)
        try:
            return await self._ollama_generate(prompt, system_prompt, temperature)
        except Exception as e:
            errors.append(f"Ollama: {e}")
            logger.debug("Ollama unavailable: %s", e)

        # Try Groq (free tier)
        if self.groq_api_key:
            try:
                return await self._groq_generate(prompt, system_prompt, temperature, max_tokens)
            except Exception as e:
                errors.append(f"Groq: {e}")
                logger.debug("Groq failed: %s", e)

        # Try OpenAI (paid)
        if self.openai_api_key:
            try:
                return await self._openai_generate(prompt, system_prompt, temperature, max_tokens)
            except Exception as e:
                errors.append(f"OpenAI: {e}")
                logger.debug("OpenAI failed: %s", e)

        raise RuntimeError(f"All LLM providers failed: {'; '.join(errors)}")

    async def _ollama_generate(
        self, prompt: str, system_prompt: str, temperature: float
    ) -> LLMResponse:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        resp = await self._http.post(
            f"{self.ollama_base_url}/api/chat",
            json={
                "model": self.ollama_model,
                "messages": messages,
                "stream": False,
                "options": {"temperature": temperature},
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return LLMResponse(
            text=data["message"]["content"],
            model=self.ollama_model,
            provider="ollama",
            tokens_used=data.get("eval_count", 0),
        )

    async def _groq_generate(
        self, prompt: str, system_prompt: str, temperature: float, max_tokens: int
    ) -> LLMResponse:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        resp = await self._http.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {self.groq_api_key}"},
            json={
                "model": self.groq_model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return LLMResponse(
            text=data["choices"][0]["message"]["content"],
            model=self.groq_model,
            provider="groq",
            tokens_used=data.get("usage", {}).get("total_tokens", 0),
        )

    async def _openai_generate(
        self, prompt: str, system_prompt: str, temperature: float, max_tokens: int
    ) -> LLMResponse:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        resp = await self._http.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {self.openai_api_key}"},
            json={
                "model": self.openai_model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return LLMResponse(
            text=data["choices"][0]["message"]["content"],
            model=self.openai_model,
            provider="openai",
            tokens_used=data.get("usage", {}).get("total_tokens", 0),
        )

    async def close(self):
        await self._http.aclose()


_client: LLMClient | None = None


def get_llm_client() -> LLMClient:
    """Get or create the singleton LLM client."""
    global _client
    if _client is None:
        from config.settings import get_settings
        s = get_settings()
        _client = LLMClient(
            ollama_base_url=s.ollama_base_url,
            ollama_model=s.ollama_model,
            groq_api_key=s.groq_api_key,
            groq_model=s.groq_model,
            openai_api_key=s.openai_api_key,
            openai_model=s.openai_model,
        )
    return _client
