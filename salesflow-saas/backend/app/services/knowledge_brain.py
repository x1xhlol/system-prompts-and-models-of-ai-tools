"""
Knowledge Brain — Dealix Second Brain Service
Project knowledge management: ingest, query, lint, index.
"""
import logging, re, uuid
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
WIKI_DIR = Path(__file__).resolve().parents[4] / "memory" / "wiki"
INDEX_DIR = Path(__file__).resolve().parents[4] / "memory" / "indexes"
MEMORY_DIR = Path(__file__).resolve().parents[4] / "memory"
STALE_DAYS = 30


class PageType(str, Enum):
    ARCHITECTURE = "architecture"; PRODUCT = "product"; GTM = "gtm"
    CUSTOMER = "customer"; OPERATIONS = "operations"; SECURITY = "security"
    TOOLING = "tooling"; GLOSSARY = "glossary"

class Confidence(str, Enum):
    HIGH = "high"; MEDIUM = "medium"; LOW = "low"

class IssueSeverity(str, Enum):
    ERROR = "error"; WARNING = "warning"; INFO = "info"


class WikiPage(BaseModel):
    """صفحة ويكي منظمة — Structured wiki page"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str; title_ar: str = ""
    page_type: PageType; summary: str; summary_ar: str
    key_facts: list[str] = []; provenance: str
    confidence: Confidence = Confidence.MEDIUM
    related_pages: list[str] = []
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    stale: bool = False; file_path: str = ""; body: str = ""

class BrainAnswer(BaseModel):
    """إجابة من الدماغ المعرفي"""
    question: str; answer: str; answer_ar: str = ""
    sources: list[str] = []; confidence: Confidence = Confidence.LOW
    related_pages: list[str] = []

class BrainIssue(BaseModel):
    """مشكلة جودة مكتشفة أثناء الفحص"""
    issue_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    severity: IssueSeverity; category: str
    title: str; title_ar: str; description: str
    affected_page: str = ""; recommendation: str = ""


class KnowledgeBrain:
    """إدارة المعرفة — استيعاب، استعلام، فحص"""

    def __init__(self, wiki_dir: Path = None, memory_dir: Path = None):
        self.wiki_dir = wiki_dir or WIKI_DIR
        self.memory_dir = memory_dir or MEMORY_DIR
        self.index_dir = INDEX_DIR
        self._cache: dict[str, WikiPage] = {}
        self.wiki_dir.mkdir(parents=True, exist_ok=True)
        self.index_dir.mkdir(parents=True, exist_ok=True)

    def _parse_frontmatter(self, content: str, fpath: str) -> WikiPage:
        lines, title, fields, body_start = content.split("\n"), "", {}, 0
        for i, ln in enumerate(lines):
            s = ln.strip()
            if s.startswith("# "): title = s[2:].strip()
            elif s == "---": body_start = i + 1; break
            elif s.startswith("**") and "**:" in s:
                m = re.match(r"\*\*(.+?)\*\*:\s*(.*)", s)
                if m: fields[m.group(1).lower().replace(" ", "_")] = m.group(2).strip()
        body = "\n".join(lines[body_start:]).strip() if body_start else ""
        key_facts, in_f = [], False
        for ln in lines:
            if "**Key Facts**" in ln: in_f = True; continue
            if in_f:
                fm = re.match(r"^\s*-\s+(.+)$", ln)
                if fm: key_facts.append(fm.group(1).strip())
                elif ln.strip().startswith("**"): break
        related = re.findall(r"\[.+?\]\((.+?)\)", fields.get("related_pages", ""))
        pt = next((p for p in PageType if p.value == fields.get("type", "").lower()), PageType.ARCHITECTURE)
        cf = next((c for c in Confidence if c.value == fields.get("confidence", "").lower()), Confidence.MEDIUM)
        try: lu = datetime.strptime(fields.get("last_updated", ""), "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except ValueError: lu = datetime.now(timezone.utc)
        return WikiPage(title=title, page_type=pt, summary=fields.get("summary", ""),
            summary_ar=fields.get("summary_ar", ""), key_facts=key_facts,
            provenance=fields.get("provenance", ""), confidence=cf, related_pages=related,
            last_updated=lu, stale=fields.get("stale", "false").lower() == "true",
            file_path=fpath, body=body)

    async def _load_all_pages(self) -> list[WikiPage]:
        pages = []
        if not self.wiki_dir.exists(): return pages
        for f in sorted(self.wiki_dir.glob("*.md")):
            if f.name == "README.md": continue
            try:
                p = self._parse_frontmatter(f.read_text(encoding="utf-8"), str(f))
                self._cache[p.id] = p; pages.append(p)
            except Exception as e: logger.warning("فشل تحميل %s: %s", f.name, e)
        return pages

    def _classify(self, source_type: str, content: str) -> PageType:
        if source_type in ("adr", "architecture"): return PageType.ARCHITECTURE
        if source_type in ("customer_interview", "feedback"): return PageType.CUSTOMER
        cl = content.lower()
        kw = {PageType.ARCHITECTURE: ["api","database","service","backend"],
              PageType.GTM: ["launch","marketing","outreach","growth","تسويق"],
              PageType.CUSTOMER: ["customer","interview","feedback","عميل"],
              PageType.SECURITY: ["pdpl","consent","security","أمان"],
              PageType.TOOLING: ["provider","integration","tool","أداة"],
              PageType.OPERATIONS: ["runbook","checklist","process","عملية"]}
        scores = {t: sum(1 for w in ws if w in cl) for t, ws in kw.items()}
        best = max(scores, key=scores.get)
        return best if scores[best] > 0 else PageType.PRODUCT

    def _find_related(self, content: str, pages: list[WikiPage]) -> list[WikiPage]:
        cw = set(content.lower().split())
        scored = [(p, len(cw & set(p.summary.lower().split()))) for p in pages]
        return [p for p, s in sorted(scored, key=lambda x: -x[1]) if s > 2][:5]

    def _render(self, p: WikiPage) -> str:
        facts = "\n".join(f"  - {f}" for f in p.key_facts) or "  - (none)"
        rels = ", ".join(f"[{Path(r).stem}]({r})" for r in p.related_pages) or "(none)"
        return (f"# {p.title}\n\n**Type**: {p.page_type.value}\n**Summary**: {p.summary}\n"
            f"**Summary_AR**: {p.summary_ar}\n**Key Facts**:\n{facts}\n"
            f"**Provenance**: {p.provenance}\n**Confidence**: {p.confidence.value}\n"
            f"**Related Pages**: {rels}\n**Last Updated**: {p.last_updated:%Y-%m-%d}\n"
            f"**Stale**: {str(p.stale).lower()}\n\n---\n\n{p.body}\n")

    async def ingest(self, source_type: str, content: str, metadata: dict[str, Any] = None) -> WikiPage:
        """تصنيف المحتوى، إنشاء صفحة ويكي، ربط الصفحات ذات الصلة."""
        md = metadata or {}
        existing = await self._load_all_pages()
        related = self._find_related(content, existing)
        page = WikiPage(
            title=md.get("title", f"Ingested — {source_type}"),
            title_ar=md.get("title_ar", f"مستوعب — {source_type}"),
            page_type=self._classify(source_type, content),
            summary=content[:120].replace("\n", " ").strip(),
            summary_ar=md.get("summary_ar", f"محتوى {source_type} مستوعب تلقائياً"),
            key_facts=md.get("key_facts", []),
            provenance=md.get("provenance", f"Auto-ingested from {source_type}"),
            confidence=Confidence(md.get("confidence", "medium")),
            related_pages=[p.file_path for p in related[:5]], body=content)
        fname = re.sub(r"[^\w\s-]", "", page.title.lower()).replace(" ", "-")[:50]
        fp = self.wiki_dir / f"{fname}.md"; page.file_path = str(fp)
        fp.write_text(self._render(page), encoding="utf-8")
        self._cache[page.id] = page
        logger.info("تم استيعاب صفحة: %s (%s)", page.title, page.page_type.value)
        return page

    async def query(self, question: str, domain: str = None) -> BrainAnswer:
        """البحث في الويكي والذاكرة عن إجابات ذات صلة."""
        pages = await self._load_all_pages()
        if domain:
            try: pages = [p for p in pages if p.page_type == PageType(domain)]
            except ValueError: pass
        qw = set(question.lower().split())
        scored = []
        for p in pages:
            sw = set(f"{p.title} {p.summary} {' '.join(p.key_facts)}".lower().split())
            ov = len(qw & sw)
            if ov > 0:
                s = (ov / max(len(qw), 1)) * (1.3 if p.confidence == Confidence.HIGH else 0.7 if p.confidence == Confidence.LOW else 1.0)
                scored.append((p, s))
        scored.sort(key=lambda x: -x[1])
        if not scored:
            return BrainAnswer(question=question, answer="لم يتم العثور على معلومات ذات صلة.",
                answer_ar="لم يتم العثور على معلومات ذات صلة.", confidence=Confidence.LOW)
        bp, bs = scored[0]
        ans = bp.summary + (" Key facts: " + "; ".join(bp.key_facts[:3]) if bp.key_facts else "")
        conf = Confidence.HIGH if bs > 0.5 else Confidence.MEDIUM if bs > 0.2 else Confidence.LOW
        return BrainAnswer(question=question, answer=ans, answer_ar=bp.summary_ar or "لا يوجد ملخص عربي",
            sources=[p.file_path for p, _ in scored[:3]], confidence=conf,
            related_pages=[p.file_path for p, _ in scored[:3]])

    async def lint(self) -> list[BrainIssue]:
        """فحص: صفحات يتيمة، قديمة، مصدر مفقود، تكرارات، فهارس فارغة."""
        issues, pages, now = [], await self._load_all_pages(), datetime.now(timezone.utc)
        targets: set[str] = set()
        for p in pages:
            for r in p.related_pages: targets.add(str((Path(p.file_path).parent / r).resolve()))
            age = (now - p.last_updated).days
            if age > STALE_DAYS:
                issues.append(BrainIssue(severity=IssueSeverity.WARNING, category="stale",
                    title=f"Stale: {p.title}", title_ar=f"قديمة: {p.title}",
                    description=f"Updated {age}d ago", affected_page=p.file_path,
                    recommendation="Review and update or archive."))
            if not p.provenance:
                issues.append(BrainIssue(severity=IssueSeverity.ERROR, category="provenance",
                    title=f"No provenance: {p.title}", title_ar=f"مصدر مفقود: {p.title}",
                    description="Missing source.", affected_page=p.file_path,
                    recommendation="Add provenance."))
            if not p.summary_ar:
                issues.append(BrainIssue(severity=IssueSeverity.WARNING, category="i18n",
                    title=f"No Arabic summary: {p.title}", title_ar=f"ملخص عربي مفقود: {p.title}",
                    description="Arabic-first.", affected_page=p.file_path, recommendation="Add summary_ar."))
        for p in pages:
            if str(Path(p.file_path).resolve()) not in targets and p.page_type != PageType.GLOSSARY:
                issues.append(BrainIssue(severity=IssueSeverity.INFO, category="orphan",
                    title=f"Orphan: {p.title}", title_ar=f"يتيمة: {p.title}",
                    description="No inbound links.", affected_page=p.file_path,
                    recommendation="Link from another page."))
        seen: set[str] = set()
        for p in pages:
            t = p.title.lower().strip()
            if t in seen:
                issues.append(BrainIssue(severity=IssueSeverity.WARNING, category="duplicate",
                    title=f"Duplicate: {p.title}", title_ar=f"تكرار: {p.title}",
                    description="Duplicate title.", affected_page=p.file_path, recommendation="Merge."))
            seen.add(t)
        if self.index_dir.exists():
            for f in self.index_dir.glob("*.md"):
                if len(f.read_text(encoding="utf-8").strip()) < 50:
                    issues.append(BrainIssue(severity=IssueSeverity.WARNING, category="empty_index",
                        title=f"Empty: {f.name}", title_ar=f"فارغ: {f.name}",
                        description="Sparse index.", affected_page=str(f), recommendation="Populate."))
        logger.info("فحص الدماغ: %d مشكلة", len(issues))
        return issues

    async def get_index(self, domain: str) -> list[WikiPage]:
        """إرجاع جميع الصفحات في نطاق معين."""
        pages = await self._load_all_pages()
        try: return [p for p in pages if p.page_type == PageType(domain)]
        except ValueError: return []

    async def mark_stale(self, page_id: str) -> None:
        """تعليم صفحة كقديمة."""
        page = self._cache.get(page_id)
        if not page:
            for p in await self._load_all_pages():
                if p.id == page_id: page = p; break
        if not page: logger.error("صفحة غير موجودة: %s", page_id); return
        page.stale = True
        fp = Path(page.file_path)
        if fp.exists():
            fp.write_text(re.sub(r"\*\*Stale\*\*:\s*false", "**Stale**: true",
                fp.read_text(encoding="utf-8")), encoding="utf-8")

    async def promote_raw(self, raw_id: str, raw_content: str = None, metadata: dict[str, Any] = None) -> WikiPage:
        """تحويل مادة خام إلى صفحة ويكي منظمة."""
        md = metadata or {}
        if raw_content is None:
            rp = self.memory_dir / "raw" / f"{raw_id}.md"
            if rp.exists(): raw_content = rp.read_text(encoding="utf-8")
            else: raise FileNotFoundError(f"المادة الخام غير موجودة: {raw_id}")
        return await self.ingest("raw_promotion", raw_content, {
            "title": md.get("title", f"Promoted — {raw_id}"),
            "title_ar": md.get("title_ar", f"مروّج — {raw_id}"),
            "provenance": f"Promoted from raw {raw_id}",
            "confidence": md.get("confidence", "medium"), **md})


knowledge_brain = KnowledgeBrain()
