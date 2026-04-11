"""
Local Inference Adapter — Dealix AI Revenue OS
Connects to local/private LLM providers (Ollama, LM Studio, Atomic Chat)
via OpenAI-compatible API. Privacy-first, cost-optimized, Arabic-tuned.
"""
import logging
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class LocalProvider(BaseModel):
    name: str
    base_url: str  # e.g., "http://localhost:11434/v1" for Ollama
    model: str  # e.g., "qwen2.5:7b", "llama3.1:8b"
    is_healthy: bool = False
    last_check: Optional[datetime] = None
    avg_latency_ms: float = 0.0
    total_calls: int = 0
    total_failures: int = 0


# Default local providers to check
DEFAULT_PROVIDERS = [
    LocalProvider(
        name="ollama",
        base_url="http://localhost:11434/v1",
        model="qwen2.5:7b",
    ),
    LocalProvider(
        name="lm-studio",
        base_url="http://localhost:1234/v1",
        model="local-model",
    ),
    LocalProvider(
        name="atomic-chat",
        base_url="http://localhost:8080/v1",
        model="default",
    ),
]

# Tasks suitable for local inference
LOCAL_SUITABLE_TASKS = {
    "arabic_summarization": "تلخيص نصوص عربية",
    "text_classification": "تصنيف نصوص",
    "entity_extraction": "استخراج كيانات",
    "internal_drafting": "صياغة مسودات داخلية",
    "sentiment_analysis": "تحليل المشاعر",
    "translation": "ترجمة نصوص",
    "data_cleaning": "تنظيف بيانات",
    "code_review_simple": "مراجعة كود بسيطة",
}

# Tasks that should NEVER use local inference
CLOUD_ONLY_TASKS = {
    "proposal_generation",
    "complex_reasoning",
    "long_document_analysis",
    "customer_facing_messages",
}


class LocalInferenceResult(BaseModel):
    provider: str
    model: str
    response: str
    latency_ms: int
    tokens_used: int = 0
    cost_usd: float = 0.0  # Local = free
    success: bool = True
    error: Optional[str] = None


class LocalInferenceAdapter:
    """
    Adapter for local/private LLM inference.
    Tries providers in order, falls back gracefully to cloud.
    """

    def __init__(self):
        self._providers = list(DEFAULT_PROVIDERS)
        self._primary: Optional[LocalProvider] = None

    async def health_check(self, provider: LocalProvider = None) -> bool:
        """Check if a local provider is available."""
        targets = [provider] if provider else self._providers
        for p in targets:
            try:
                import httpx
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.get(f"{p.base_url}/models")
                    if resp.status_code == 200:
                        p.is_healthy = True
                        p.last_check = datetime.now(timezone.utc)
                        if not self._primary:
                            self._primary = p
                        logger.info(f"Local provider {p.name} is healthy at {p.base_url}")
                        return True
            except Exception:
                p.is_healthy = False
                p.last_check = datetime.now(timezone.utc)
                continue
        return False

    async def health_check_all(self) -> dict[str, bool]:
        """Check all configured local providers."""
        results = {}
        for p in self._providers:
            results[p.name] = await self.health_check(p)
        return results

    def is_suitable_for_local(self, task_type: str) -> bool:
        """Check if a task should use local inference."""
        if task_type in CLOUD_ONLY_TASKS:
            return False
        return task_type in LOCAL_SUITABLE_TASKS

    async def complete(
        self,
        prompt: str,
        system_prompt: str = "",
        task_type: str = "general",
        max_tokens: int = 1024,
        temperature: float = 0.7,
    ) -> LocalInferenceResult:
        """Run inference on local provider. Falls back gracefully."""
        if not self._primary or not self._primary.is_healthy:
            await self.health_check()

        if not self._primary:
            return LocalInferenceResult(
                provider="none",
                model="none",
                response="",
                latency_ms=0,
                success=False,
                error="لا يوجد مزود محلي متاح — استخدم السحابة",
            )

        start = datetime.now(timezone.utc)
        provider = self._primary

        try:
            import httpx
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(
                    f"{provider.base_url}/chat/completions",
                    json={
                        "model": provider.model,
                        "messages": messages,
                        "max_tokens": max_tokens,
                        "temperature": temperature,
                    },
                )
                resp.raise_for_status()
                data = resp.json()

            latency = int((datetime.now(timezone.utc) - start).total_seconds() * 1000)
            provider.total_calls += 1
            provider.avg_latency_ms = (
                (provider.avg_latency_ms * (provider.total_calls - 1) + latency)
                / provider.total_calls
            )

            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            tokens = data.get("usage", {}).get("total_tokens", 0)

            return LocalInferenceResult(
                provider=provider.name,
                model=provider.model,
                response=content,
                latency_ms=latency,
                tokens_used=tokens,
                cost_usd=0.0,
            )

        except Exception as e:
            provider.total_failures += 1
            provider.is_healthy = False
            latency = int((datetime.now(timezone.utc) - start).total_seconds() * 1000)
            logger.warning(f"Local inference failed on {provider.name}: {e}")
            return LocalInferenceResult(
                provider=provider.name,
                model=provider.model,
                response="",
                latency_ms=latency,
                success=False,
                error=str(e),
            )

    def add_provider(self, name: str, base_url: str, model: str) -> None:
        """Register a new local provider."""
        self._providers.append(LocalProvider(
            name=name, base_url=base_url, model=model,
        ))

    def get_providers(self) -> list[dict]:
        """List all configured providers with health status."""
        return [
            {
                "name": p.name,
                "base_url": p.base_url,
                "model": p.model,
                "healthy": p.is_healthy,
                "last_check": p.last_check.isoformat() if p.last_check else None,
                "avg_latency_ms": round(p.avg_latency_ms, 1),
                "total_calls": p.total_calls,
                "failure_rate": round(
                    p.total_failures / p.total_calls * 100, 1
                ) if p.total_calls > 0 else 0,
                "is_primary": p == self._primary,
            }
            for p in self._providers
        ]

    def get_suitable_tasks(self) -> dict[str, str]:
        """List tasks suitable for local inference."""
        return dict(LOCAL_SUITABLE_TASKS)


local_inference = LocalInferenceAdapter()
