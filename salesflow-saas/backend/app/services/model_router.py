"""
Multi-Model AI Router — Saudi AI Company Brain
Routes requests to the best AI model based on task type.
GLM-5 = Sales Brain | Groq = Fast Classification | Claude = Copy | Gemini = Research
"""
import httpx
import json
import os
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


class ModelRouter:
    """Routes AI requests to the optimal model based on task type."""

    ROUTING_TABLE = {
        # GLM-5 (Z.AI) — Sales decisions, closing, strategy
        "sales_decision": "glm5",
        "close": "glm5",
        "strategy": "glm5",
        "followup_plan": "glm5",
        "lead_qualify": "glm5",
        "objection_handle": "glm5",

        # Groq — Fast classification, tagging
        "fast_classify": "groq",
        "lead_score": "groq",
        "intent_detect": "groq",
        "sentiment": "groq",
        "tag": "groq",

        # Claude — Copy, proposals, landing pages
        "proposal_copy": "claude",
        "landing_copy": "claude",
        "email_draft": "claude",
        "whatsapp_template": "claude",
        "report": "claude",

        # Gemini — Research, document analysis
        "research": "gemini",
        "document_analysis": "gemini",
        "market_intel": "gemini",
        "competitor_analysis": "gemini",

        # DeepSeek — Code, integrations
        "coding": "deepseek",
        "integration": "deepseek",
        "debug": "deepseek",
    }

    def __init__(self):
        self.groq_key = os.getenv("GROQ_API_KEY", "")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.deepseek_key = os.getenv("DEEPSEEK_API_KEY", "")
        self.zai_key = os.getenv("ZAI_API_KEY", "")
        self.gemini_key = os.getenv("GOOGLE_API_KEY", "")
        self.zai_base = os.getenv("ZAI_BASE_URL", "https://api.z.ai/api/paas/v4/")

    def get_model_for_task(self, task_type: str) -> str:
        return self.ROUTING_TABLE.get(task_type, "groq")

    async def route(self, task_type: str, prompt: str,
                    system_prompt: str = "", temperature: float = 0.3,
                    max_tokens: int = 2048) -> Dict[str, Any]:
        """Route request to the best model."""
        model_id = self.get_model_for_task(task_type)

        try:
            if model_id == "groq":
                return await self._call_groq(prompt, system_prompt, temperature, max_tokens)
            elif model_id == "glm5":
                return await self._call_glm5(prompt, system_prompt, temperature, max_tokens)
            elif model_id == "claude":
                return await self._call_claude(prompt, system_prompt, temperature, max_tokens)
            elif model_id == "gemini":
                return await self._call_gemini(prompt, system_prompt, temperature, max_tokens)
            elif model_id == "deepseek":
                return await self._call_deepseek(prompt, system_prompt, temperature, max_tokens)
            else:
                return await self._call_groq(prompt, system_prompt, temperature, max_tokens)
        except Exception as e:
            logger.warning(f"Model {model_id} failed: {e}, falling back to Groq")
            try:
                return await self._call_groq(prompt, system_prompt, temperature, max_tokens)
            except Exception as e2:
                return {"text": f"All models failed: {e2}", "model": "error", "error": True}

    async def _call_groq(self, prompt: str, system: str = "",
                         temp: float = 0.3, max_tokens: int = 2048) -> Dict:
        if not self.groq_key:
            return {"text": "GROQ_API_KEY not set", "model": "groq", "error": True}

        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {self.groq_key}"},
                json={
                    "model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
                    "messages": messages,
                    "temperature": temp,
                    "max_tokens": max_tokens,
                }
            )
            data = resp.json()
            return {
                "text": data["choices"][0]["message"]["content"],
                "model": "groq",
                "usage": data.get("usage", {}),
            }

    async def _call_glm5(self, prompt: str, system: str = "",
                         temp: float = 0.3, max_tokens: int = 2048) -> Dict:
        if not self.zai_key:
            logger.warning("ZAI_API_KEY not set, falling back to Groq")
            return await self._call_groq(prompt, system, temp, max_tokens)

        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{self.zai_base}chat/completions",
                headers={"Authorization": f"Bearer {self.zai_key}"},
                json={
                    "model": "glm-4-plus",
                    "messages": messages,
                    "temperature": temp,
                    "max_tokens": max_tokens,
                }
            )
            data = resp.json()
            text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            return {"text": text, "model": "glm5", "usage": data.get("usage", {})}

    async def _call_claude(self, prompt: str, system: str = "",
                           temp: float = 0.3, max_tokens: int = 2048) -> Dict:
        if not self.anthropic_key:
            return await self._call_groq(prompt, system, temp, max_tokens)

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.anthropic_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": max_tokens,
                    "system": system or "You are a Saudi AI sales expert.",
                    "messages": [{"role": "user", "content": prompt}],
                }
            )
            data = resp.json()
            text = data.get("content", [{}])[0].get("text", "")
            return {"text": text, "model": "claude", "usage": data.get("usage", {})}

    async def _call_gemini(self, prompt: str, system: str = "",
                           temp: float = 0.3, max_tokens: int = 2048) -> Dict:
        if not self.gemini_key:
            return await self._call_groq(prompt, system, temp, max_tokens)

        full_prompt = f"{system}\n\n{prompt}" if system else prompt
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_key}",
                json={
                    "contents": [{"parts": [{"text": full_prompt}]}],
                    "generationConfig": {"temperature": temp, "maxOutputTokens": max_tokens}
                }
            )
            data = resp.json()
            text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return {"text": text, "model": "gemini", "usage": {}}

    async def _call_deepseek(self, prompt: str, system: str = "",
                             temp: float = 0.3, max_tokens: int = 2048) -> Dict:
        if not self.deepseek_key:
            return await self._call_groq(prompt, system, temp, max_tokens)

        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.deepseek.com/chat/completions",
                headers={"Authorization": f"Bearer {self.deepseek_key}"},
                json={
                    "model": "deepseek-chat",
                    "messages": messages,
                    "temperature": temp,
                    "max_tokens": max_tokens,
                }
            )
            data = resp.json()
            text = data["choices"][0]["message"]["content"]
            return {"text": text, "model": "deepseek", "usage": data.get("usage", {})}


# Singleton
_router: Optional[ModelRouter] = None

def get_router() -> ModelRouter:
    global _router
    if _router is None:
        _router = ModelRouter()
    return _router
