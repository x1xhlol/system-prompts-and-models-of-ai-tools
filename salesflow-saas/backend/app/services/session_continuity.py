"""
Session Continuity — Dealix AI Session State Management
Maintains context across AI agent sessions for seamless handoff.
"""
import json, logging, uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
SESSIONS_DIR = Path(__file__).resolve().parents[4] / "memory" / "_sessions"
SESSIONS_DIR.mkdir(parents=True, exist_ok=True)


class Decision(BaseModel):
    """قرار مسجّل"""
    decision: str; context: str; decision_ar: str = ""; made_by: str = ""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Failure(BaseModel):
    """فشل مسجّل"""
    description: str; context: str; description_ar: str = ""; resolution: str = ""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Win(BaseModel):
    """نجاح مسجّل"""
    description: str; context: str; description_ar: str = ""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FollowUp(BaseModel):
    """مهمة متابعة معلّقة"""
    task: str; task_ar: str = ""; due_date: Optional[datetime] = None
    completed: bool = False; assigned_to: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionState(BaseModel):
    """حالة الجلسة الكاملة"""
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project: str = "dealix"; active_workstreams: list[str] = []
    last_decisions: list[Decision] = []; open_questions: list[str] = []
    recent_failures: list[Failure] = []; recent_wins: list[Win] = []
    pending_followups: list[FollowUp] = []
    context_summary: str = ""; context_summary_ar: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    tags: list[str] = []; tenant_id: str = ""


def _dt_hook(obj: Any) -> Any:
    """Convert datetime strings in nested dicts."""
    if isinstance(obj, dict):
        for k in ("timestamp", "created_at", "updated_at", "due_date"):
            if k in obj and isinstance(obj[k], str) and obj[k]:
                obj[k] = datetime.fromisoformat(obj[k])
        return obj
    return obj


class SessionContinuity:
    """الحفاظ على السياق عبر جلسات الذكاء الاصطناعي"""

    def __init__(self, sessions_dir: Path = None):
        self.dir = sessions_dir or SESSIONS_DIR
        self.dir.mkdir(parents=True, exist_ok=True)
        self._current: Optional[SessionState] = None

    def _path(self, sid: str) -> Path: return self.dir / f"{sid}.json"

    def _save_json(self, state: SessionState) -> None:
        data = state.model_dump(mode="json")
        # Ensure all datetimes are ISO strings
        for key in ("created_at", "updated_at"):
            if isinstance(data.get(key), datetime): data[key] = data[key].isoformat()
        for lst in ("last_decisions", "recent_failures", "recent_wins", "pending_followups"):
            for item in data.get(lst, []):
                for dk in ("timestamp", "created_at", "updated_at", "due_date"):
                    if dk in item and isinstance(item[dk], datetime): item[dk] = item[dk].isoformat()
        self._path(state.session_id).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    def _load_json(self, path: Path) -> SessionState:
        data = json.loads(path.read_text(encoding="utf-8"))
        for key in ("created_at", "updated_at"): _dt_hook(data) if key in data else None
        for lst in ("last_decisions", "recent_failures", "recent_wins", "pending_followups"):
            for item in data.get(lst, []): _dt_hook(item)
        # Parse top-level dates
        for k in ("created_at", "updated_at"):
            if isinstance(data.get(k), str): data[k] = datetime.fromisoformat(data[k])
        return SessionState(**data)

    async def save_state(self, state: SessionState) -> str:
        """حفظ حالة الجلسة."""
        state.updated_at = datetime.now(timezone.utc)
        self._save_json(state); self._current = state
        logger.info("حفظ جلسة: %s", state.session_id); return state.session_id

    async def restore_state(self, session_id: str = None) -> SessionState:
        """استعادة حالة الجلسة — الأحدث إذا لم يُحدد معرف."""
        if session_id:
            p = self._path(session_id)
            if p.exists():
                s = self._load_json(p); self._current = s; return s
            return SessionState(session_id=session_id)
        # Find latest
        latest = max(self.dir.glob("*.json"), key=lambda f: f.stat().st_mtime, default=None)
        if latest:
            s = self._load_json(latest); self._current = s; return s
        s = SessionState(); await self.save_state(s); return s

    async def get_restore_prompt(self) -> str:
        """توليد نص ملخّص للحالة الحالية لتغذية جلسة جديدة."""
        s = self._current or await self.restore_state()
        lines = [f"# Session Restore — استعادة الجلسة",
            f"**Project**: {s.project}  |  **Session**: {s.session_id}",
            f"**Updated**: {s.updated_at.isoformat()}", ""]
        if s.context_summary:
            lines += ["## Context (السياق)", s.context_summary]
            if s.context_summary_ar: lines.append(s.context_summary_ar)
            lines.append("")
        if s.active_workstreams:
            lines += ["## Workstreams (مسارات العمل)"] + [f"- {w}" for w in s.active_workstreams] + [""]
        if s.last_decisions:
            lines.append("## Decisions (القرارات)")
            for d in s.last_decisions[-5:]:
                lines.append(f"- [{d.timestamp:%Y-%m-%d %H:%M}] {d.decision}")
                if d.decision_ar: lines.append(f"  {d.decision_ar}")
            lines.append("")
        if s.open_questions:
            lines += ["## Questions (أسئلة)"] + [f"- {q}" for q in s.open_questions] + [""]
        if s.recent_failures:
            lines.append("## Failures (إخفاقات)")
            for f in s.recent_failures[-3:]:
                lines.append(f"- {f.description}")
                if f.resolution: lines.append(f"  Fix: {f.resolution}")
            lines.append("")
        if s.recent_wins:
            lines += ["## Wins (نجاحات)"] + [f"- {w.description}" for w in s.recent_wins[-3:]] + [""]
        pending = [fu for fu in s.pending_followups if not fu.completed]
        if pending:
            lines.append("## Follow-ups (متابعات)")
            for fu in pending:
                due = f" (due: {fu.due_date:%Y-%m-%d})" if fu.due_date else ""
                lines.append(f"- {fu.task}{due}")
            lines.append("")
        lines += ["---", "Continue from this state. Prioritize pending follow-ups.",
            "استمر من هذه الحالة. أعطِ الأولوية للمتابعات المعلّقة."]
        return "\n".join(lines)

    async def _ensure_current(self) -> SessionState:
        if not self._current: self._current = await self.restore_state()
        return self._current

    async def add_decision(self, decision: str, context: str, decision_ar: str = "", made_by: str = "") -> None:
        """تسجيل قرار."""
        s = await self._ensure_current()
        s.last_decisions.append(Decision(decision=decision, context=context, decision_ar=decision_ar, made_by=made_by))
        if len(s.last_decisions) > 20: s.last_decisions = s.last_decisions[-20:]
        await self.save_state(s)

    async def add_failure(self, description: str, context: str, description_ar: str = "", resolution: str = "") -> None:
        """تسجيل فشل."""
        s = await self._ensure_current()
        s.recent_failures.append(Failure(description=description, context=context, description_ar=description_ar, resolution=resolution))
        if len(s.recent_failures) > 10: s.recent_failures = s.recent_failures[-10:]
        await self.save_state(s)

    async def add_win(self, description: str, context: str, description_ar: str = "") -> None:
        """تسجيل نجاح."""
        s = await self._ensure_current()
        s.recent_wins.append(Win(description=description, context=context, description_ar=description_ar))
        if len(s.recent_wins) > 10: s.recent_wins = s.recent_wins[-10:]
        await self.save_state(s)

    async def add_followup(self, task: str, due_date: datetime = None, task_ar: str = "", assigned_to: str = "") -> None:
        """إضافة مهمة متابعة."""
        s = await self._ensure_current()
        s.pending_followups.append(FollowUp(task=task, task_ar=task_ar, due_date=due_date, assigned_to=assigned_to))
        await self.save_state(s)

    async def complete_followup(self, task_substring: str) -> bool:
        """تعليم متابعة كمكتملة."""
        s = await self._ensure_current()
        tl = task_substring.lower()
        for fu in s.pending_followups:
            if tl in fu.task.lower() and not fu.completed:
                fu.completed = True; await self.save_state(s); return True
        return False

    async def set_workstreams(self, workstreams: list[str]) -> None:
        s = await self._ensure_current(); s.active_workstreams = workstreams; await self.save_state(s)

    async def set_context(self, summary: str, summary_ar: str = "") -> None:
        s = await self._ensure_current()
        s.context_summary = summary; s.context_summary_ar = summary_ar; await self.save_state(s)

    async def add_question(self, question: str) -> None:
        s = await self._ensure_current()
        if question not in s.open_questions:
            s.open_questions.append(question)
            if len(s.open_questions) > 15: s.open_questions = s.open_questions[-15:]
            await self.save_state(s)

    async def cleanup_old_sessions(self, days: int = 30) -> int:
        """حذف جلسات أقدم من N يوم."""
        cutoff, removed = datetime.now(timezone.utc) - timedelta(days=days), 0
        for f in self.dir.glob("*.json"):
            try:
                d = json.loads(f.read_text(encoding="utf-8"))
                u = d.get("updated_at", "")
                if isinstance(u, str) and u and datetime.fromisoformat(u) < cutoff:
                    f.unlink(); removed += 1
            except Exception: pass
        logger.info("حذف %d جلسة قديمة", removed); return removed

    async def list_sessions(self, limit: int = 20) -> list[dict[str, Any]]:
        """عرض الجلسات الأخيرة."""
        sessions = []
        for f in sorted(self.dir.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)[:limit]:
            try:
                d = json.loads(f.read_text(encoding="utf-8"))
                sessions.append({"session_id": d.get("session_id", f.stem), "project": d.get("project", ""),
                    "updated_at": d.get("updated_at", ""), "workstreams": d.get("active_workstreams", []),
                    "decisions": len(d.get("last_decisions", [])),
                    "pending": sum(1 for fu in d.get("pending_followups", []) if not fu.get("completed"))})
            except Exception: continue
        return sessions


session_continuity = SessionContinuity()
