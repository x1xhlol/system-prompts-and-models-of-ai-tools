"""
Memory Engine — Dealix MemPalace Pattern
Pluggable memory adapter with evaluation and quality checks.
Supports Redis (production) and file-based (local/offline) backends.
"""
import json
import logging
import os
import re
import uuid
from abc import ABC, abstractmethod
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

MEMORY_BASE_DIR = Path(__file__).resolve().parents[4] / "memory"
STALENESS_DAYS = 30


# ---------------------------------------------------------------------------
# Models — نماذج البيانات
# ---------------------------------------------------------------------------

class MemoryDomain(str):
    """Domain tag for memory items."""
    pass


class MemoryItem(BaseModel):
    """A single memory item — عنصر ذاكرة واحد"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    domain: str = "project"  # project, customer, deal, competitor, prompt
    content: str
    metadata: dict[str, Any] = {}
    source: str = ""
    confidence: float = Field(default=0.7, ge=0.0, le=1.0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    access_count: int = 0
    is_canonical: bool = True  # True = business data, False = derived/AI-generated
    retention_days: int = 0  # 0 = permanent
    tenant_id: str = ""
    tags: list[str] = []

    class Config:
        json_schema_extra = {
            "example": {
                "domain": "customer",
                "content": "Acme Corp prefers WhatsApp for all communication",
                "source": "customer_interview_2026-04-10",
                "confidence": 0.9,
                "is_canonical": True,
            }
        }


class EvalResult(BaseModel):
    """Evaluation result for memory quality — نتيجة تقييم جودة الذاكرة"""
    total_queries: int = 0
    correct_retrievals: int = 0
    precision: float = 0.0
    recall: float = 0.0
    avg_rank: float = 0.0
    message_ar: str = ""


class MemoryStats(BaseModel):
    """Memory store statistics — إحصائيات مخزن الذاكرة"""
    total_items: int = 0
    by_domain: dict[str, int] = {}
    canonical_count: int = 0
    derived_count: int = 0
    avg_confidence: float = 0.0
    oldest_item: Optional[datetime] = None
    newest_item: Optional[datetime] = None
    message_ar: str = ""


# ---------------------------------------------------------------------------
# Abstract Adapter — المحول المجرد
# ---------------------------------------------------------------------------

class MemoryAdapter(ABC):
    """Abstract adapter — swap backends without rewriting app."""

    @abstractmethod
    async def store(self, item: MemoryItem) -> str:
        """Store item, return ID — تخزين عنصر وإرجاع المعرف"""

    @abstractmethod
    async def retrieve(
        self, query: str, domain: str = None, limit: int = 5
    ) -> list[MemoryItem]:
        """Retrieve matching items — استرجاع العناصر المطابقة"""

    @abstractmethod
    async def update(self, item_id: str, content: str) -> bool:
        """Update item content — تحديث محتوى العنصر"""

    @abstractmethod
    async def delete(self, item_id: str) -> bool:
        """Delete item — حذف العنصر"""

    @abstractmethod
    async def search_by_entity(
        self, entity_type: str, entity_id: str
    ) -> list[MemoryItem]:
        """Search by entity reference — البحث بمرجع الكيان"""

    @abstractmethod
    async def get_stats(self) -> MemoryStats:
        """Return store statistics — إرجاع إحصائيات المخزن"""

    @abstractmethod
    async def list_all(self, domain: str = None) -> list[MemoryItem]:
        """List all items optionally filtered by domain."""


# ---------------------------------------------------------------------------
# Redis Adapter — محول ريدس
# ---------------------------------------------------------------------------

class RedisMemoryAdapter(MemoryAdapter):
    """
    Redis-backed memory for fast retrieval.
    Uses Redis Search if available, falls back to key scanning.
    ذاكرة مدعومة بريدس للاسترجاع السريع.
    """

    KEY_PREFIX = "dealix:memory:"

    def __init__(self, redis_client: Any = None, redis_url: str = None):
        self._redis = redis_client
        self._redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self._connected = False

    async def _ensure_connection(self) -> None:
        if self._redis is not None and self._connected:
            return
        try:
            import redis.asyncio as aioredis
            self._redis = aioredis.from_url(
                self._redis_url, decode_responses=True
            )
            await self._redis.ping()
            self._connected = True
            logger.info("تم الاتصال بريدس: %s", self._redis_url)
        except Exception as exc:
            logger.warning("فشل الاتصال بريدس: %s — سيتم استخدام الذاكرة المحلية", exc)
            self._connected = False
            raise

    def _key(self, item_id: str) -> str:
        return f"{self.KEY_PREFIX}{item_id}"

    def _domain_key(self, domain: str) -> str:
        return f"{self.KEY_PREFIX}domain:{domain}"

    def _entity_key(self, entity_type: str, entity_id: str) -> str:
        return f"{self.KEY_PREFIX}entity:{entity_type}:{entity_id}"

    async def store(self, item: MemoryItem) -> str:
        await self._ensure_connection()
        data = item.model_dump(mode="json")
        data["created_at"] = item.created_at.isoformat()
        data["updated_at"] = item.updated_at.isoformat()
        pipe = self._redis.pipeline()
        pipe.set(self._key(item.id), json.dumps(data, ensure_ascii=False))
        pipe.sadd(self._domain_key(item.domain), item.id)
        if item.retention_days > 0:
            pipe.expire(self._key(item.id), item.retention_days * 86400)
        # Index by entity if metadata has entity references
        for etype in ("lead_id", "deal_id", "company_id", "tenant_id"):
            if etype in item.metadata:
                pipe.sadd(self._entity_key(etype, str(item.metadata[etype])), item.id)
        await pipe.execute()
        logger.info("تم تخزين عنصر ذاكرة في ريدس: %s (%s)", item.id, item.domain)
        return item.id

    async def retrieve(
        self, query: str, domain: str = None, limit: int = 5
    ) -> list[MemoryItem]:
        await self._ensure_connection()
        if domain:
            ids = await self._redis.smembers(self._domain_key(domain))
        else:
            all_keys = []
            async for key in self._redis.scan_iter(f"{self.KEY_PREFIX}[0-9a-f]*"):
                all_keys.append(key.replace(self.KEY_PREFIX, ""))
            ids = all_keys

        items: list[MemoryItem] = []
        query_lower = query.lower()
        query_words = set(query_lower.split())

        for item_id in ids:
            raw = await self._redis.get(self._key(item_id))
            if not raw:
                continue
            data = json.loads(raw)
            content_lower = data.get("content", "").lower()
            content_words = set(content_lower.split())
            overlap = len(query_words & content_words)
            if overlap > 0 or query_lower in content_lower:
                data["created_at"] = datetime.fromisoformat(data["created_at"])
                data["updated_at"] = datetime.fromisoformat(data["updated_at"])
                item = MemoryItem(**data)
                item.access_count += 1
                items.append(item)

        items.sort(key=lambda x: x.confidence, reverse=True)
        return items[:limit]

    async def update(self, item_id: str, content: str) -> bool:
        await self._ensure_connection()
        raw = await self._redis.get(self._key(item_id))
        if not raw:
            return False
        data = json.loads(raw)
        data["content"] = content
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await self._redis.set(self._key(item_id), json.dumps(data, ensure_ascii=False))
        return True

    async def delete(self, item_id: str) -> bool:
        await self._ensure_connection()
        raw = await self._redis.get(self._key(item_id))
        if not raw:
            return False
        data = json.loads(raw)
        domain = data.get("domain", "project")
        pipe = self._redis.pipeline()
        pipe.delete(self._key(item_id))
        pipe.srem(self._domain_key(domain), item_id)
        await pipe.execute()
        return True

    async def search_by_entity(
        self, entity_type: str, entity_id: str
    ) -> list[MemoryItem]:
        await self._ensure_connection()
        ids = await self._redis.smembers(self._entity_key(entity_type, entity_id))
        items: list[MemoryItem] = []
        for item_id in ids:
            raw = await self._redis.get(self._key(item_id))
            if raw:
                data = json.loads(raw)
                data["created_at"] = datetime.fromisoformat(data["created_at"])
                data["updated_at"] = datetime.fromisoformat(data["updated_at"])
                items.append(MemoryItem(**data))
        return items

    async def get_stats(self) -> MemoryStats:
        await self._ensure_connection()
        items = await self.list_all()
        return _compute_stats(items)

    async def list_all(self, domain: str = None) -> list[MemoryItem]:
        await self._ensure_connection()
        if domain:
            ids = await self._redis.smembers(self._domain_key(domain))
        else:
            ids = set()
            async for key in self._redis.scan_iter(f"{self.KEY_PREFIX}[0-9a-f]*"):
                ids.add(key.replace(self.KEY_PREFIX, ""))
        items = []
        for item_id in ids:
            raw = await self._redis.get(self._key(item_id))
            if raw:
                data = json.loads(raw)
                data["created_at"] = datetime.fromisoformat(data["created_at"])
                data["updated_at"] = datetime.fromisoformat(data["updated_at"])
                items.append(MemoryItem(**data))
        return items


# ---------------------------------------------------------------------------
# File Adapter — محول الملفات
# ---------------------------------------------------------------------------

class FileMemoryAdapter(MemoryAdapter):
    """
    File-based memory for local/offline use.
    Stores as JSON files in memory/ directory.
    ذاكرة مبنية على الملفات للاستخدام المحلي/غير المتصل.
    """

    def __init__(self, base_dir: Path = None):
        self.base_dir = base_dir or MEMORY_BASE_DIR / "_store"
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _item_path(self, item_id: str) -> Path:
        return self.base_dir / f"{item_id}.json"

    def _domain_dir(self, domain: str) -> Path:
        d = self.base_dir / domain
        d.mkdir(parents=True, exist_ok=True)
        return d

    async def store(self, item: MemoryItem) -> str:
        file_path = self._domain_dir(item.domain) / f"{item.id}.json"
        data = item.model_dump(mode="json")
        data["created_at"] = item.created_at.isoformat()
        data["updated_at"] = item.updated_at.isoformat()
        file_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        logger.info("تم تخزين عنصر ذاكرة في ملف: %s (%s)", item.id, item.domain)
        return item.id

    async def retrieve(
        self, query: str, domain: str = None, limit: int = 5
    ) -> list[MemoryItem]:
        items = await self.list_all(domain)
        query_lower = query.lower()
        query_words = set(query_lower.split())
        scored: list[tuple[MemoryItem, float]] = []

        for item in items:
            content_lower = item.content.lower()
            content_words = set(content_lower.split())
            overlap = len(query_words & content_words)
            if overlap > 0 or query_lower in content_lower:
                score = (overlap / max(len(query_words), 1)) * item.confidence
                scored.append((item, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        results = [item for item, _ in scored[:limit]]
        for item in results:
            item.access_count += 1
            await self._write_item(item)
        return results

    async def update(self, item_id: str, content: str) -> bool:
        item = await self._find_item(item_id)
        if not item:
            return False
        item.content = content
        item.updated_at = datetime.now(timezone.utc)
        await self._write_item(item)
        return True

    async def delete(self, item_id: str) -> bool:
        for domain_dir in self.base_dir.iterdir():
            if not domain_dir.is_dir():
                continue
            path = domain_dir / f"{item_id}.json"
            if path.exists():
                path.unlink()
                logger.info("تم حذف عنصر ذاكرة: %s", item_id)
                return True
        return False

    async def search_by_entity(
        self, entity_type: str, entity_id: str
    ) -> list[MemoryItem]:
        all_items = await self.list_all()
        return [
            item for item in all_items
            if str(item.metadata.get(entity_type, "")) == str(entity_id)
        ]

    async def get_stats(self) -> MemoryStats:
        items = await self.list_all()
        return _compute_stats(items)

    async def list_all(self, domain: str = None) -> list[MemoryItem]:
        items: list[MemoryItem] = []
        search_dirs = (
            [self._domain_dir(domain)] if domain
            else [d for d in self.base_dir.iterdir() if d.is_dir()]
        )
        for dir_path in search_dirs:
            for json_file in dir_path.glob("*.json"):
                try:
                    data = json.loads(json_file.read_text(encoding="utf-8"))
                    if "created_at" in data and isinstance(data["created_at"], str):
                        data["created_at"] = datetime.fromisoformat(data["created_at"])
                    if "updated_at" in data and isinstance(data["updated_at"], str):
                        data["updated_at"] = datetime.fromisoformat(data["updated_at"])
                    items.append(MemoryItem(**data))
                except Exception as exc:
                    logger.warning("فشل تحميل عنصر ذاكرة %s: %s", json_file.name, exc)
        return items

    async def _find_item(self, item_id: str) -> Optional[MemoryItem]:
        for domain_dir in self.base_dir.iterdir():
            if not domain_dir.is_dir():
                continue
            path = domain_dir / f"{item_id}.json"
            if path.exists():
                data = json.loads(path.read_text(encoding="utf-8"))
                if isinstance(data.get("created_at"), str):
                    data["created_at"] = datetime.fromisoformat(data["created_at"])
                if isinstance(data.get("updated_at"), str):
                    data["updated_at"] = datetime.fromisoformat(data["updated_at"])
                return MemoryItem(**data)
        return None

    async def _write_item(self, item: MemoryItem) -> None:
        file_path = self._domain_dir(item.domain) / f"{item.id}.json"
        data = item.model_dump(mode="json")
        data["created_at"] = item.created_at.isoformat()
        data["updated_at"] = item.updated_at.isoformat()
        file_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _compute_stats(items: list[MemoryItem]) -> MemoryStats:
    if not items:
        return MemoryStats(message_ar="لا توجد عناصر في الذاكرة")
    by_domain: dict[str, int] = defaultdict(int)
    canonical = 0
    total_conf = 0.0
    oldest = items[0].created_at
    newest = items[0].created_at
    for item in items:
        by_domain[item.domain] += 1
        if item.is_canonical:
            canonical += 1
        total_conf += item.confidence
        if item.created_at < oldest:
            oldest = item.created_at
        if item.created_at > newest:
            newest = item.created_at
    return MemoryStats(
        total_items=len(items),
        by_domain=dict(by_domain),
        canonical_count=canonical,
        derived_count=len(items) - canonical,
        avg_confidence=round(total_conf / len(items), 4),
        oldest_item=oldest,
        newest_item=newest,
        message_ar=f"إجمالي العناصر: {len(items)}، المعتمدة: {canonical}، المشتقة: {len(items) - canonical}",
    )


# ---------------------------------------------------------------------------
# Memory Evaluator — مقيّم الذاكرة
# ---------------------------------------------------------------------------

class MemoryEvaluator:
    """
    Evaluate memory quality before trusting it.
    تقييم جودة الذاكرة قبل الوثوق بها.
    """

    def __init__(self, adapter: MemoryAdapter):
        self._adapter = adapter

    async def benchmark_retrieval(
        self,
        test_queries: list[str],
        expected_results: list[list[str]],
    ) -> EvalResult:
        """
        Run retrieval benchmark against known query/result pairs.
        تشغيل اختبار الاسترجاع مقابل أزواج استعلام/نتيجة معروفة.
        """
        if len(test_queries) != len(expected_results):
            raise ValueError("test_queries and expected_results must have same length")

        total = len(test_queries)
        correct = 0
        total_recall = 0.0
        total_rank = 0.0

        for query, expected in zip(test_queries, expected_results):
            results = await self._adapter.retrieve(query, limit=10)
            result_contents = [r.content.lower().strip() for r in results]
            expected_lower = [e.lower().strip() for e in expected]

            found_any = False
            best_rank = len(results) + 1
            matched = 0
            for exp in expected_lower:
                for rank, res in enumerate(result_contents):
                    if exp in res or SequenceMatcher(None, exp, res).ratio() > 0.7:
                        found_any = True
                        matched += 1
                        best_rank = min(best_rank, rank + 1)
                        break

            if found_any:
                correct += 1
            if expected_lower:
                total_recall += matched / len(expected_lower)
            total_rank += best_rank if found_any else len(results) + 1

        precision = correct / total if total else 0.0
        recall = total_recall / total if total else 0.0
        avg_rank = total_rank / total if total else 0.0

        return EvalResult(
            total_queries=total,
            correct_retrievals=correct,
            precision=round(precision, 4),
            recall=round(recall, 4),
            avg_rank=round(avg_rank, 2),
            message_ar=f"الدقة: {precision:.2%}، الاستدعاء: {recall:.2%}، متوسط الترتيب: {avg_rank:.1f}",
        )

    async def check_staleness(self, domain: str = None) -> list[MemoryItem]:
        """
        Items not accessed in 30+ days.
        العناصر التي لم يتم الوصول إليها منذ 30 يومًا أو أكثر.
        """
        items = await self._adapter.list_all(domain)
        cutoff = datetime.now(timezone.utc) - timedelta(days=STALENESS_DAYS)
        return [item for item in items if item.updated_at < cutoff]

    async def check_duplicates(self, domain: str = None) -> list[tuple[MemoryItem, MemoryItem]]:
        """
        Find similar items that may be duplicates.
        البحث عن عناصر متشابهة قد تكون مكررة.
        """
        items = await self._adapter.list_all(domain)
        duplicates: list[tuple[MemoryItem, MemoryItem]] = []
        seen: set[str] = set()

        for i, a in enumerate(items):
            for b in items[i + 1:]:
                pair_key = f"{a.id}:{b.id}"
                if pair_key in seen:
                    continue
                ratio = SequenceMatcher(None, a.content.lower(), b.content.lower()).ratio()
                if ratio > 0.8:
                    duplicates.append((a, b))
                    seen.add(pair_key)

        return duplicates

    async def check_contradictions(self, domain: str = None) -> list[tuple[MemoryItem, MemoryItem]]:
        """
        Find items in the same domain with conflicting content.
        البحث عن عناصر في نفس النطاق بمحتوى متناقض.
        """
        items = await self._adapter.list_all(domain)
        contradictions: list[tuple[MemoryItem, MemoryItem]] = []
        negation_markers = {"not", "no", "never", "cannot", "لا", "ليس", "لن", "لم", "غير"}

        for i, a in enumerate(items):
            a_words = set(a.content.lower().split())
            for b in items[i + 1:]:
                if a.domain != b.domain:
                    continue
                b_words = set(b.content.lower().split())
                shared = a_words & b_words
                a_negations = a_words & negation_markers
                b_negations = b_words & negation_markers
                # If they share many words but differ in negation, flag as contradiction
                if len(shared) > 3 and a_negations != b_negations:
                    contradictions.append((a, b))

        return contradictions

    async def get_health_report(self) -> dict[str, Any]:
        """
        Overall memory health metrics.
        مقاييس صحة الذاكرة العامة.
        """
        stats = await self._adapter.get_stats()
        stale = await self.check_staleness()
        duplicates = await self.check_duplicates()
        contradictions = await self.check_contradictions()

        health_score = 1.0
        if stats.total_items > 0:
            stale_ratio = len(stale) / stats.total_items
            dup_ratio = len(duplicates) / stats.total_items
            contra_ratio = len(contradictions) / stats.total_items
            health_score = max(0.0, 1.0 - stale_ratio * 0.3 - dup_ratio * 0.4 - contra_ratio * 0.5)

        return {
            "health_score": round(health_score, 4),
            "total_items": stats.total_items,
            "stale_items": len(stale),
            "duplicate_pairs": len(duplicates),
            "contradiction_pairs": len(contradictions),
            "avg_confidence": stats.avg_confidence,
            "by_domain": stats.by_domain,
            "message_ar": (
                f"درجة الصحة: {health_score:.2%}، "
                f"عناصر قديمة: {len(stale)}، "
                f"تكرارات: {len(duplicates)}، "
                f"تناقضات: {len(contradictions)}"
            ),
        }


# ---------------------------------------------------------------------------
# Factory — مصنع المحولات
# ---------------------------------------------------------------------------

def create_memory_adapter(backend: str = None) -> MemoryAdapter:
    """
    Create the appropriate memory adapter based on config.
    إنشاء محول الذاكرة المناسب بناءً على التكوين.
    """
    backend = backend or os.getenv("MEMORY_BACKEND", "file")
    if backend == "redis":
        return RedisMemoryAdapter()
    return FileMemoryAdapter()


# Global instances
memory_adapter = create_memory_adapter()
memory_evaluator = MemoryEvaluator(memory_adapter)
