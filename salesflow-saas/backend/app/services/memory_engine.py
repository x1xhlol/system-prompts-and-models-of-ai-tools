"""
Memory Engine — Dealix MemPalace Pattern
Pluggable memory adapter with evaluation and quality checks.
"""
import json, logging, os, uuid
from abc import ABC, abstractmethod
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
MEMORY_BASE = Path(__file__).resolve().parents[4] / "memory"
STALE_DAYS = 30


class MemoryItem(BaseModel):
    """عنصر ذاكرة واحد"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    domain: str = "project"  # project, customer, deal, competitor, prompt
    content: str; metadata: dict[str, Any] = {}; source: str = ""
    confidence: float = Field(default=0.7, ge=0.0, le=1.0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    access_count: int = 0
    is_canonical: bool = True  # True = business data, False = derived/AI
    retention_days: int = 0  # 0 = permanent
    tenant_id: str = ""; tags: list[str] = []

class EvalResult(BaseModel):
    """نتيجة تقييم جودة الذاكرة"""
    total_queries: int = 0; correct_retrievals: int = 0
    precision: float = 0.0; recall: float = 0.0; avg_rank: float = 0.0
    message_ar: str = ""

class MemoryStats(BaseModel):
    """إحصائيات مخزن الذاكرة"""
    total_items: int = 0; by_domain: dict[str, int] = {}
    canonical_count: int = 0; derived_count: int = 0; avg_confidence: float = 0.0
    oldest_item: Optional[datetime] = None; newest_item: Optional[datetime] = None
    message_ar: str = ""


class MemoryAdapter(ABC):
    """Abstract adapter — swap backends without rewriting app."""
    @abstractmethod
    async def store(self, item: MemoryItem) -> str: ...
    @abstractmethod
    async def retrieve(self, query: str, domain: str = None, limit: int = 5) -> list[MemoryItem]: ...
    @abstractmethod
    async def update(self, item_id: str, content: str) -> bool: ...
    @abstractmethod
    async def delete(self, item_id: str) -> bool: ...
    @abstractmethod
    async def search_by_entity(self, entity_type: str, entity_id: str) -> list[MemoryItem]: ...
    @abstractmethod
    async def get_stats(self) -> MemoryStats: ...
    @abstractmethod
    async def list_all(self, domain: str = None) -> list[MemoryItem]: ...


def _compute_stats(items: list[MemoryItem]) -> MemoryStats:
    if not items: return MemoryStats(message_ar="لا توجد عناصر")
    by_d: dict[str, int] = defaultdict(int)
    can, tc = 0, 0.0
    old = new = items[0].created_at
    for i in items:
        by_d[i.domain] += 1; can += i.is_canonical; tc += i.confidence
        if i.created_at < old: old = i.created_at
        if i.created_at > new: new = i.created_at
    return MemoryStats(total_items=len(items), by_domain=dict(by_d), canonical_count=can,
        derived_count=len(items)-can, avg_confidence=round(tc/len(items), 4),
        oldest_item=old, newest_item=new,
        message_ar=f"عناصر: {len(items)}، معتمدة: {can}، مشتقة: {len(items)-can}")

def _parse_dt(v: Any) -> datetime:
    return datetime.fromisoformat(v) if isinstance(v, str) else v


class RedisMemoryAdapter(MemoryAdapter):
    """ذاكرة مدعومة بريدس للاسترجاع السريع."""
    PFX = "dealix:memory:"

    def __init__(self, redis_client: Any = None, redis_url: str = None):
        self._redis = redis_client
        self._url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self._ok = False

    async def _conn(self):
        if self._redis and self._ok: return
        import redis.asyncio as aioredis
        self._redis = aioredis.from_url(self._url, decode_responses=True)
        await self._redis.ping(); self._ok = True

    def _k(self, id: str) -> str: return f"{self.PFX}{id}"
    def _dk(self, d: str) -> str: return f"{self.PFX}domain:{d}"
    def _ek(self, et: str, eid: str) -> str: return f"{self.PFX}entity:{et}:{eid}"

    async def store(self, item: MemoryItem) -> str:
        await self._conn()
        data = item.model_dump(mode="json")
        data["created_at"] = item.created_at.isoformat(); data["updated_at"] = item.updated_at.isoformat()
        pipe = self._redis.pipeline()
        pipe.set(self._k(item.id), json.dumps(data, ensure_ascii=False))
        pipe.sadd(self._dk(item.domain), item.id)
        if item.retention_days > 0: pipe.expire(self._k(item.id), item.retention_days * 86400)
        for et in ("lead_id","deal_id","company_id","tenant_id"):
            if et in item.metadata: pipe.sadd(self._ek(et, str(item.metadata[et])), item.id)
        await pipe.execute(); return item.id

    async def retrieve(self, query: str, domain: str = None, limit: int = 5) -> list[MemoryItem]:
        await self._conn()
        ids = await self._redis.smembers(self._dk(domain)) if domain else [
            k.replace(self.PFX, "") async for k in self._redis.scan_iter(f"{self.PFX}[0-9a-f]*")]
        qw, items = set(query.lower().split()), []
        for iid in ids:
            raw = await self._redis.get(self._k(iid))
            if not raw: continue
            d = json.loads(raw); cl = d.get("content", "").lower()
            if qw & set(cl.split()) or query.lower() in cl:
                d["created_at"] = _parse_dt(d["created_at"]); d["updated_at"] = _parse_dt(d["updated_at"])
                items.append(MemoryItem(**d))
        items.sort(key=lambda x: -x.confidence); return items[:limit]

    async def update(self, item_id: str, content: str) -> bool:
        await self._conn()
        raw = await self._redis.get(self._k(item_id))
        if not raw: return False
        d = json.loads(raw); d["content"] = content; d["updated_at"] = datetime.now(timezone.utc).isoformat()
        await self._redis.set(self._k(item_id), json.dumps(d, ensure_ascii=False)); return True

    async def delete(self, item_id: str) -> bool:
        await self._conn()
        raw = await self._redis.get(self._k(item_id))
        if not raw: return False
        d = json.loads(raw)
        pipe = self._redis.pipeline(); pipe.delete(self._k(item_id))
        pipe.srem(self._dk(d.get("domain", "project")), item_id); await pipe.execute(); return True

    async def search_by_entity(self, entity_type: str, entity_id: str) -> list[MemoryItem]:
        await self._conn()
        items = []
        for iid in await self._redis.smembers(self._ek(entity_type, entity_id)):
            raw = await self._redis.get(self._k(iid))
            if raw:
                d = json.loads(raw); d["created_at"] = _parse_dt(d["created_at"]); d["updated_at"] = _parse_dt(d["updated_at"])
                items.append(MemoryItem(**d))
        return items

    async def get_stats(self) -> MemoryStats: return _compute_stats(await self.list_all())

    async def list_all(self, domain: str = None) -> list[MemoryItem]:
        await self._conn()
        ids = await self._redis.smembers(self._dk(domain)) if domain else {
            k.replace(self.PFX, "") async for k in self._redis.scan_iter(f"{self.PFX}[0-9a-f]*")}
        items = []
        for iid in ids:
            raw = await self._redis.get(self._k(iid))
            if raw:
                d = json.loads(raw); d["created_at"] = _parse_dt(d["created_at"]); d["updated_at"] = _parse_dt(d["updated_at"])
                items.append(MemoryItem(**d))
        return items


class FileMemoryAdapter(MemoryAdapter):
    """ذاكرة مبنية على الملفات للاستخدام المحلي."""

    def __init__(self, base_dir: Path = None):
        self.base = base_dir or MEMORY_BASE / "_store"; self.base.mkdir(parents=True, exist_ok=True)

    def _dd(self, domain: str) -> Path:
        d = self.base / domain; d.mkdir(parents=True, exist_ok=True); return d

    def _ser(self, item: MemoryItem) -> str:
        d = item.model_dump(mode="json")
        d["created_at"] = item.created_at.isoformat(); d["updated_at"] = item.updated_at.isoformat()
        return json.dumps(d, ensure_ascii=False, indent=2)

    def _de(self, path: Path) -> MemoryItem:
        d = json.loads(path.read_text(encoding="utf-8"))
        d["created_at"] = _parse_dt(d["created_at"]); d["updated_at"] = _parse_dt(d["updated_at"])
        return MemoryItem(**d)

    async def store(self, item: MemoryItem) -> str:
        (self._dd(item.domain) / f"{item.id}.json").write_text(self._ser(item), encoding="utf-8")
        logger.info("ذاكرة ملف: %s (%s)", item.id, item.domain); return item.id

    async def retrieve(self, query: str, domain: str = None, limit: int = 5) -> list[MemoryItem]:
        items = await self.list_all(domain); qw = set(query.lower().split())
        scored = []
        for it in items:
            cw = set(it.content.lower().split()); ov = len(qw & cw)
            if ov > 0 or query.lower() in it.content.lower():
                scored.append((it, (ov / max(len(qw), 1)) * it.confidence))
        scored.sort(key=lambda x: -x[1])
        for it, _ in scored[:limit]: it.access_count += 1; await self._write(it)
        return [it for it, _ in scored[:limit]]

    async def update(self, item_id: str, content: str) -> bool:
        it = await self._find(item_id)
        if not it: return False
        it.content = content; it.updated_at = datetime.now(timezone.utc); await self._write(it); return True

    async def delete(self, item_id: str) -> bool:
        for dd in self.base.iterdir():
            if not dd.is_dir(): continue
            p = dd / f"{item_id}.json"
            if p.exists(): p.unlink(); return True
        return False

    async def search_by_entity(self, entity_type: str, entity_id: str) -> list[MemoryItem]:
        return [i for i in await self.list_all() if str(i.metadata.get(entity_type, "")) == str(entity_id)]

    async def get_stats(self) -> MemoryStats: return _compute_stats(await self.list_all())

    async def list_all(self, domain: str = None) -> list[MemoryItem]:
        dirs = [self._dd(domain)] if domain else [d for d in self.base.iterdir() if d.is_dir()]
        items = []
        for dd in dirs:
            for f in dd.glob("*.json"):
                try: items.append(self._de(f))
                except Exception as e: logger.warning("فشل تحميل %s: %s", f.name, e)
        return items

    async def _find(self, item_id: str) -> Optional[MemoryItem]:
        for dd in self.base.iterdir():
            if not dd.is_dir(): continue
            p = dd / f"{item_id}.json"
            if p.exists(): return self._de(p)
        return None

    async def _write(self, item: MemoryItem) -> None:
        (self._dd(item.domain) / f"{item.id}.json").write_text(self._ser(item), encoding="utf-8")


class MemoryEvaluator:
    """تقييم جودة الذاكرة قبل الوثوق بها."""

    def __init__(self, adapter: MemoryAdapter):
        self._a = adapter

    async def benchmark_retrieval(self, test_queries: list[str], expected_results: list[list[str]]) -> EvalResult:
        if len(test_queries) != len(expected_results):
            raise ValueError("Mismatched lengths")
        total, correct, t_recall, t_rank = len(test_queries), 0, 0.0, 0.0
        for q, exp in zip(test_queries, expected_results):
            res = [r.content.lower().strip() for r in await self._a.retrieve(q, limit=10)]
            el = [e.lower().strip() for e in exp]; found, best, matched = False, len(res)+1, 0
            for e in el:
                for rank, r in enumerate(res):
                    if e in r or SequenceMatcher(None, e, r).ratio() > 0.7:
                        found = True; matched += 1; best = min(best, rank+1); break
            if found: correct += 1
            if el: t_recall += matched / len(el)
            t_rank += best if found else len(res)+1
        p, r = (correct/total if total else 0), (t_recall/total if total else 0)
        ar = t_rank/total if total else 0
        return EvalResult(total_queries=total, correct_retrievals=correct,
            precision=round(p, 4), recall=round(r, 4), avg_rank=round(ar, 2),
            message_ar=f"الدقة: {p:.2%}، الاستدعاء: {r:.2%}")

    async def check_staleness(self, domain: str = None) -> list[MemoryItem]:
        cutoff = datetime.now(timezone.utc) - timedelta(days=STALE_DAYS)
        return [i for i in await self._a.list_all(domain) if i.updated_at < cutoff]

    async def check_duplicates(self, domain: str = None) -> list[tuple[MemoryItem, MemoryItem]]:
        items, dups, seen = await self._a.list_all(domain), [], set()
        for i, a in enumerate(items):
            for b in items[i+1:]:
                k = f"{a.id}:{b.id}"
                if k not in seen and SequenceMatcher(None, a.content.lower(), b.content.lower()).ratio() > 0.8:
                    dups.append((a, b)); seen.add(k)
        return dups

    async def check_contradictions(self, domain: str = None) -> list[tuple[MemoryItem, MemoryItem]]:
        items, contras = await self._a.list_all(domain), []
        negs = {"not","no","never","cannot","لا","ليس","لن","لم","غير"}
        for i, a in enumerate(items):
            aw = set(a.content.lower().split())
            for b in items[i+1:]:
                if a.domain != b.domain: continue
                bw = set(b.content.lower().split())
                if len(aw & bw) > 3 and (aw & negs) != (bw & negs): contras.append((a, b))
        return contras

    async def get_health_report(self) -> dict[str, Any]:
        stats = await self._a.get_stats()
        stale = await self.check_staleness(); dups = await self.check_duplicates()
        contras = await self.check_contradictions()
        hs = max(0.0, 1.0 - (len(stale)/max(stats.total_items,1))*0.3
            - (len(dups)/max(stats.total_items,1))*0.4
            - (len(contras)/max(stats.total_items,1))*0.5) if stats.total_items else 1.0
        return {"health_score": round(hs, 4), "total_items": stats.total_items,
            "stale_items": len(stale), "duplicate_pairs": len(dups),
            "contradiction_pairs": len(contras), "avg_confidence": stats.avg_confidence,
            "by_domain": stats.by_domain,
            "message_ar": f"صحة: {hs:.2%}، قديمة: {len(stale)}، تكرار: {len(dups)}، تناقض: {len(contras)}"}


def create_memory_adapter(backend: str = None) -> MemoryAdapter:
    backend = backend or os.getenv("MEMORY_BACKEND", "file")
    return RedisMemoryAdapter() if backend == "redis" else FileMemoryAdapter()

memory_adapter = create_memory_adapter()
memory_evaluator = MemoryEvaluator(memory_adapter)
