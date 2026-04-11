"""
Knowledge Brain — Dealix Second Brain Service
Project knowledge management: ingest, query, lint, index.
Manages the wiki layer in memory/wiki/ and indexes in memory/indexes/.
"""
import logging
import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

WIKI_DIR = Path(__file__).resolve().parents[4] / "memory" / "wiki"
INDEX_DIR = Path(__file__).resolve().parents[4] / "memory" / "indexes"
MEMORY_DIR = Path(__file__).resolve().parents[4] / "memory"
STALE_THRESHOLD_DAYS = 30


class PageType(str, Enum):
    ARCHITECTURE = "architecture"
    PRODUCT = "product"
    GTM = "gtm"
    CUSTOMER = "customer"
    OPERATIONS = "operations"
    SECURITY = "security"
    TOOLING = "tooling"
    GLOSSARY = "glossary"


class Confidence(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class IssueSeverity(str, Enum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


class WikiPage(BaseModel):
    """Structured wiki page — صفحة ويكي منظمة"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    title_ar: str = ""
    page_type: PageType
    summary: str
    summary_ar: str
    key_facts: list[str] = []
    provenance: str
    confidence: Confidence = Confidence.MEDIUM
    related_pages: list[str] = []
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    stale: bool = False
    file_path: str = ""
    body: str = ""

    class Config:
        json_schema_extra = {
            "example": {
                "title": "System Architecture",
                "title_ar": "بنية النظام",
                "page_type": "architecture",
                "summary": "Multi-tenant AI CRM architecture overview",
                "summary_ar": "نظرة عامة على بنية إدارة علاقات العملاء متعددة المستأجرين",
            }
        }


class BrainAnswer(BaseModel):
    """Answer from the knowledge brain — إجابة من الدماغ المعرفي"""
    question: str
    answer: str
    answer_ar: str = ""
    sources: list[str] = []
    confidence: Confidence = Confidence.LOW
    related_pages: list[str] = []


class BrainIssue(BaseModel):
    """Quality issue found during lint — مشكلة جودة مكتشفة أثناء الفحص"""
    issue_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    severity: IssueSeverity
    category: str
    title: str
    title_ar: str
    description: str
    affected_page: str = ""
    recommendation: str = ""


class KnowledgeBrain:
    """
    Project knowledge management — ingest, query, lint.
    إدارة المعرفة المشروعية — استيعاب، استعلام، فحص.
    """

    def __init__(self, wiki_dir: Path = None, memory_dir: Path = None):
        self.wiki_dir = wiki_dir or WIKI_DIR
        self.memory_dir = memory_dir or MEMORY_DIR
        self.index_dir = INDEX_DIR
        self._page_cache: dict[str, WikiPage] = {}
        self._ensure_dirs()

    def _ensure_dirs(self) -> None:
        self.wiki_dir.mkdir(parents=True, exist_ok=True)
        self.index_dir.mkdir(parents=True, exist_ok=True)

    def _parse_frontmatter(self, content: str, file_path: str) -> WikiPage:
        """Parse wiki page frontmatter into a WikiPage model."""
        lines = content.split("\n")
        title = ""
        fields: dict[str, Any] = {}
        body_start = 0

        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped.startswith("# "):
                title = stripped[2:].strip()
            elif stripped == "---":
                body_start = i + 1
                break
            elif stripped.startswith("**") and "**:" in stripped:
                match = re.match(r"\*\*(.+?)\*\*:\s*(.*)", stripped)
                if match:
                    key = match.group(1).lower().replace(" ", "_")
                    value = match.group(2).strip()
                    fields[key] = value

        body = "\n".join(lines[body_start:]).strip() if body_start > 0 else ""
        key_facts = []
        if "key_facts" in fields:
            fact_pattern = re.compile(r"^\s*-\s+(.+)$")
            in_facts = False
            for line in lines:
                if "**Key Facts**" in line:
                    in_facts = True
                    continue
                if in_facts:
                    fact_match = fact_pattern.match(line)
                    if fact_match:
                        key_facts.append(fact_match.group(1).strip())
                    elif line.strip().startswith("**"):
                        break

        related = []
        if "related_pages" in fields:
            link_pattern = re.compile(r"\[.+?\]\((.+?)\)")
            related = link_pattern.findall(fields["related_pages"])

        page_type = PageType.ARCHITECTURE
        type_val = fields.get("type", "architecture").lower()
        for pt in PageType:
            if pt.value == type_val:
                page_type = pt
                break

        conf = Confidence.MEDIUM
        conf_val = fields.get("confidence", "medium").lower()
        for c in Confidence:
            if c.value == conf_val:
                conf = c
                break

        last_updated = datetime.now(timezone.utc)
        if "last_updated" in fields:
            try:
                last_updated = datetime.strptime(
                    fields["last_updated"], "%Y-%m-%d"
                ).replace(tzinfo=timezone.utc)
            except ValueError:
                pass

        stale = fields.get("stale", "false").lower() == "true"

        return WikiPage(
            title=title,
            title_ar=fields.get("title_ar", ""),
            page_type=page_type,
            summary=fields.get("summary", ""),
            summary_ar=fields.get("summary_ar", ""),
            key_facts=key_facts,
            provenance=fields.get("provenance", ""),
            confidence=conf,
            related_pages=related,
            last_updated=last_updated,
            stale=stale,
            file_path=file_path,
            body=body,
        )

    async def _load_all_pages(self) -> list[WikiPage]:
        """Load and parse all wiki pages."""
        pages = []
        if not self.wiki_dir.exists():
            return pages
        for md_file in sorted(self.wiki_dir.glob("*.md")):
            if md_file.name == "README.md":
                continue
            try:
                content = md_file.read_text(encoding="utf-8")
                page = self._parse_frontmatter(content, str(md_file))
                self._page_cache[page.id] = page
                pages.append(page)
            except Exception as exc:
                logger.warning("فشل تحميل الصفحة %s: %s", md_file.name, exc)
        return pages

    async def ingest(
        self,
        source_type: str,
        content: str,
        metadata: dict[str, Any] = None,
    ) -> WikiPage:
        """
        Classify content, create/update wiki page, link related pages.
        تصنيف المحتوى، إنشاء/تحديث صفحة ويكي، ربط الصفحات ذات الصلة.
        """
        metadata = metadata or {}
        title = metadata.get("title", f"Ingested — {source_type}")
        title_ar = metadata.get("title_ar", f"مستوعب — {source_type}")

        page_type = self._classify_content(source_type, content)
        summary = content[:120].replace("\n", " ").strip()
        summary_ar = metadata.get("summary_ar", f"محتوى {source_type} مستوعب تلقائياً")

        existing_pages = await self._load_all_pages()
        related = self._find_related(content, existing_pages)

        page = WikiPage(
            title=title,
            title_ar=title_ar,
            page_type=page_type,
            summary=summary,
            summary_ar=summary_ar,
            key_facts=metadata.get("key_facts", []),
            provenance=metadata.get("provenance", f"Auto-ingested from {source_type}"),
            confidence=Confidence(metadata.get("confidence", "medium")),
            related_pages=[p.file_path for p in related[:5]],
            body=content,
        )

        file_name = re.sub(r"[^\w\s-]", "", title.lower()).replace(" ", "-")[:50]
        file_path = self.wiki_dir / f"{file_name}.md"
        page.file_path = str(file_path)

        md_content = self._render_page(page)
        file_path.write_text(md_content, encoding="utf-8")
        self._page_cache[page.id] = page

        logger.info("تم استيعاب صفحة جديدة: %s (%s)", title, page_type.value)
        return page

    def _classify_content(self, source_type: str, content: str) -> PageType:
        """Classify content into a page type based on keywords."""
        content_lower = content.lower()
        keyword_map = {
            PageType.ARCHITECTURE: ["api", "database", "service", "backend", "frontend", "deploy"],
            PageType.PRODUCT: ["feature", "roadmap", "user story", "requirement", "ميزة"],
            PageType.GTM: ["launch", "marketing", "outreach", "growth", "campaign", "تسويق"],
            PageType.CUSTOMER: ["customer", "interview", "feedback", "icp", "عميل"],
            PageType.OPERATIONS: ["runbook", "checklist", "process", "deploy", "عملية"],
            PageType.SECURITY: ["pdpl", "consent", "security", "compliance", "أمان"],
            PageType.TOOLING: ["provider", "api key", "integration", "tool", "أداة"],
        }
        scores: dict[PageType, int] = {}
        for ptype, keywords in keyword_map.items():
            scores[ptype] = sum(1 for kw in keywords if kw in content_lower)

        if source_type in ("adr", "architecture"):
            return PageType.ARCHITECTURE
        if source_type in ("customer_interview", "feedback"):
            return PageType.CUSTOMER

        best = max(scores, key=lambda k: scores[k])
        return best if scores[best] > 0 else PageType.PRODUCT

    def _find_related(self, content: str, pages: list[WikiPage]) -> list[WikiPage]:
        """Find related pages by keyword overlap."""
        content_words = set(content.lower().split())
        scored: list[tuple[WikiPage, int]] = []
        for page in pages:
            page_words = set(page.summary.lower().split()) | set(page.body.lower().split()[:100])
            overlap = len(content_words & page_words)
            if overlap > 2:
                scored.append((page, overlap))
        scored.sort(key=lambda x: x[1], reverse=True)
        return [p for p, _ in scored[:5]]

    def _render_page(self, page: WikiPage) -> str:
        """Render a WikiPage model to markdown."""
        facts = "\n".join(f"  - {f}" for f in page.key_facts) if page.key_facts else "  - (none)"
        related = ", ".join(
            f"[{Path(r).stem}]({r})" for r in page.related_pages
        ) if page.related_pages else "(none)"
        date_str = page.last_updated.strftime("%Y-%m-%d")

        return f"""# {page.title}

**Type**: {page.page_type.value}
**Summary**: {page.summary}
**Summary_AR**: {page.summary_ar}
**Key Facts**:
{facts}
**Provenance**: {page.provenance}
**Confidence**: {page.confidence.value}
**Related Pages**: {related}
**Last Updated**: {date_str}
**Stale**: {str(page.stale).lower()}

---

{page.body}
"""

    async def query(
        self, question: str, domain: str = None
    ) -> BrainAnswer:
        """
        Search wiki + memory for relevant answers.
        البحث في الويكي والذاكرة عن إجابات ذات صلة.
        """
        pages = await self._load_all_pages()
        if domain:
            try:
                dtype = PageType(domain)
                pages = [p for p in pages if p.page_type == dtype]
            except ValueError:
                pass

        question_lower = question.lower()
        question_words = set(question_lower.split())

        scored: list[tuple[WikiPage, float]] = []
        for page in pages:
            searchable = f"{page.title} {page.summary} {page.body} {' '.join(page.key_facts)}".lower()
            searchable_words = set(searchable.split())
            overlap = len(question_words & searchable_words)
            if overlap > 0:
                score = overlap / max(len(question_words), 1)
                if page.confidence == Confidence.HIGH:
                    score *= 1.3
                elif page.confidence == Confidence.LOW:
                    score *= 0.7
                scored.append((page, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        top_pages = scored[:3]

        if not top_pages:
            return BrainAnswer(
                question=question,
                answer="لم يتم العثور على معلومات ذات صلة في قاعدة المعرفة.",
                answer_ar="لم يتم العثور على معلومات ذات صلة في قاعدة المعرفة.",
                confidence=Confidence.LOW,
            )

        best_page = top_pages[0][0]
        best_score = top_pages[0][1]

        answer_parts = [best_page.summary]
        if best_page.key_facts:
            answer_parts.append("Key facts: " + "; ".join(best_page.key_facts[:3]))

        conf = Confidence.HIGH if best_score > 0.5 else (Confidence.MEDIUM if best_score > 0.2 else Confidence.LOW)

        return BrainAnswer(
            question=question,
            answer=" ".join(answer_parts),
            answer_ar=best_page.summary_ar or "لا يوجد ملخص عربي",
            sources=[p.file_path for p, _ in top_pages],
            confidence=conf,
            related_pages=[p.file_path for p, _ in top_pages],
        )

    async def lint(self) -> list[BrainIssue]:
        """
        Check for: orphan pages, stale pages, missing provenance, duplicates, empty indexes.
        فحص: صفحات يتيمة، صفحات قديمة، مصدر مفقود، تكرارات، فهارس فارغة.
        """
        issues: list[BrainIssue] = []
        pages = await self._load_all_pages()
        now = datetime.now(timezone.utc)
        all_paths = {p.file_path for p in pages}
        all_related_targets: set[str] = set()

        for page in pages:
            for rel in page.related_pages:
                resolved = str((Path(page.file_path).parent / rel).resolve())
                all_related_targets.add(resolved)

            # Stale check (>30 days)
            age = (now - page.last_updated).days
            if age > STALE_THRESHOLD_DAYS:
                issues.append(BrainIssue(
                    severity=IssueSeverity.WARNING,
                    category="stale",
                    title=f"Stale page: {page.title}",
                    title_ar=f"صفحة قديمة: {page.title}",
                    description=f"Last updated {age} days ago (threshold: {STALE_THRESHOLD_DAYS}).",
                    affected_page=page.file_path,
                    recommendation="Review and update or archive this page.",
                ))

            # Missing provenance
            if not page.provenance or page.provenance.strip() == "":
                issues.append(BrainIssue(
                    severity=IssueSeverity.ERROR,
                    category="provenance",
                    title=f"Missing provenance: {page.title}",
                    title_ar=f"مصدر مفقود: {page.title}",
                    description="Page has no provenance. All pages must cite their source.",
                    affected_page=page.file_path,
                    recommendation="Add provenance field with source reference.",
                ))

            # Missing Arabic summary
            if not page.summary_ar:
                issues.append(BrainIssue(
                    severity=IssueSeverity.WARNING,
                    category="i18n",
                    title=f"Missing Arabic summary: {page.title}",
                    title_ar=f"ملخص عربي مفقود: {page.title}",
                    description="Page is missing summary_ar. Dealix is Arabic-first.",
                    affected_page=page.file_path,
                    recommendation="Add an Arabic summary.",
                ))

        # Orphan check
        for page in pages:
            resolved_path = str(Path(page.file_path).resolve())
            if resolved_path not in all_related_targets and page.page_type != PageType.GLOSSARY:
                issues.append(BrainIssue(
                    severity=IssueSeverity.INFO,
                    category="orphan",
                    title=f"Orphan page: {page.title}",
                    title_ar=f"صفحة يتيمة: {page.title}",
                    description="No other pages link to this page.",
                    affected_page=page.file_path,
                    recommendation="Add a link from a related page or index.",
                ))

        # Duplicate check by title similarity
        titles = [(p.title.lower().strip(), p) for p in pages]
        seen: set[str] = set()
        for title, page in titles:
            if title in seen:
                issues.append(BrainIssue(
                    severity=IssueSeverity.WARNING,
                    category="duplicate",
                    title=f"Possible duplicate: {page.title}",
                    title_ar=f"تكرار محتمل: {page.title}",
                    description=f"Multiple pages with title '{page.title}'.",
                    affected_page=page.file_path,
                    recommendation="Merge duplicate pages.",
                ))
            seen.add(title)

        # Empty index check
        if self.index_dir.exists():
            for idx_file in self.index_dir.glob("*.md"):
                content = idx_file.read_text(encoding="utf-8")
                if len(content.strip()) < 50:
                    issues.append(BrainIssue(
                        severity=IssueSeverity.WARNING,
                        category="empty_index",
                        title=f"Empty index: {idx_file.name}",
                        title_ar=f"فهرس فارغ: {idx_file.name}",
                        description="Index file has very little content.",
                        affected_page=str(idx_file),
                        recommendation="Populate or remove the index.",
                    ))

        logger.info("فحص الدماغ المعرفي: %d مشكلة مكتشفة", len(issues))
        return issues

    async def get_index(self, domain: str) -> list[WikiPage]:
        """
        Return all pages in a domain.
        إرجاع جميع الصفحات في نطاق معين.
        """
        pages = await self._load_all_pages()
        try:
            dtype = PageType(domain)
            return [p for p in pages if p.page_type == dtype]
        except ValueError:
            logger.warning("نطاق غير معروف: %s", domain)
            return []

    async def mark_stale(self, page_id: str) -> None:
        """
        Mark a page as stale.
        تعليم صفحة كقديمة.
        """
        page = self._page_cache.get(page_id)
        if not page:
            pages = await self._load_all_pages()
            for p in pages:
                if p.id == page_id:
                    page = p
                    break
        if not page:
            logger.error("صفحة غير موجودة: %s", page_id)
            return

        page.stale = True
        file_path = Path(page.file_path)
        if file_path.exists():
            content = file_path.read_text(encoding="utf-8")
            content = re.sub(
                r"\*\*Stale\*\*:\s*false",
                "**Stale**: true",
                content,
            )
            file_path.write_text(content, encoding="utf-8")
            logger.info("تم تعليم الصفحة كقديمة: %s", page.title)

    async def promote_raw(
        self,
        raw_id: str,
        raw_content: str = None,
        metadata: dict[str, Any] = None,
    ) -> WikiPage:
        """
        Convert raw material to structured wiki page.
        تحويل مادة خام إلى صفحة ويكي منظمة.
        """
        metadata = metadata or {}
        if raw_content is None:
            raw_path = self.memory_dir / "raw" / f"{raw_id}.md"
            if raw_path.exists():
                raw_content = raw_path.read_text(encoding="utf-8")
            else:
                raise FileNotFoundError(f"المادة الخام غير موجودة: {raw_id}")

        title = metadata.get("title", f"Promoted from raw — {raw_id}")
        page = await self.ingest(
            source_type="raw_promotion",
            content=raw_content,
            metadata={
                "title": title,
                "title_ar": metadata.get("title_ar", f"مروّج من مادة خام — {raw_id}"),
                "provenance": f"Promoted from raw material {raw_id}",
                "confidence": metadata.get("confidence", "medium"),
                **metadata,
            },
        )
        logger.info("تمت ترقية المادة الخام إلى صفحة ويكي: %s → %s", raw_id, page.title)
        return page


# Global singleton
knowledge_brain = KnowledgeBrain()
