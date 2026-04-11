"""
Session Continuity — Dealix AI Session State Management
Maintains context across AI agent sessions for seamless handoff.
Stores decisions, failures, wins, and follow-ups between sessions.
"""
import json
import logging
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

SESSIONS_DIR = Path(__file__).resolve().parents[4] / "memory" / "_sessions"
SESSIONS_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Models — نماذج البيانات
# ---------------------------------------------------------------------------

class Decision(BaseModel):
    """A recorded decision — قرار مسجّل"""
    decision: str
    context: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    decision_ar: str = ""
    made_by: str = ""


class Failure(BaseModel):
    """A recorded failure — فشل مسجّل"""
    description: str
    context: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    description_ar: str = ""
    resolution: str = ""


class Win(BaseModel):
    """A recorded win — نجاح مسجّل"""
    description: str
    context: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    description_ar: str = ""


class FollowUp(BaseModel):
    """A pending follow-up task — مهمة متابعة معلّقة"""
    task: str
    task_ar: str = ""
    due_date: Optional[datetime] = None
    completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    assigned_to: str = ""


class SessionState(BaseModel):
    """Full session state — حالة الجلسة الكاملة"""
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project: str = "dealix"
    active_workstreams: list[str] = []
    last_decisions: list[Decision] = []
    open_questions: list[str] = []
    recent_failures: list[Failure] = []
    recent_wins: list[Win] = []
    pending_followups: list[FollowUp] = []
    context_summary: str = ""
    context_summary_ar: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    tags: list[str] = []
    tenant_id: str = ""

    class Config:
        json_schema_extra = {
            "example": {
                "project": "dealix",
                "active_workstreams": ["cpq-enhancement", "pdpl-audit"],
                "context_summary": "Working on CPQ Arabic PDF generation and PDPL consent expiry.",
                "context_summary_ar": "العمل على توليد PDF عربي للتسعير وانتهاء موافقة حماية البيانات.",
            }
        }


# ---------------------------------------------------------------------------
# Session Continuity Service — خدمة استمرارية الجلسة
# ---------------------------------------------------------------------------

class SessionContinuity:
    """
    Maintain context across AI sessions.
    الحفاظ على السياق عبر جلسات الذكاء الاصطناعي.
    """

    def __init__(self, sessions_dir: Path = None):
        self.sessions_dir = sessions_dir or SESSIONS_DIR
        self.sessions_dir.mkdir(parents=True, exist_ok=True)
        self._current: Optional[SessionState] = None

    def _session_path(self, session_id: str) -> Path:
        return self.sessions_dir / f"{session_id}.json"

    def _serialize_state(self, state: SessionState) -> str:
        data = state.model_dump(mode="json")
        # Convert datetime objects to ISO strings for JSON
        for key in ("created_at", "updated_at"):
            if isinstance(data.get(key), datetime):
                data[key] = data[key].isoformat()
        for decision in data.get("last_decisions", []):
            if isinstance(decision.get("timestamp"), datetime):
                decision["timestamp"] = decision["timestamp"].isoformat()
        for failure in data.get("recent_failures", []):
            if isinstance(failure.get("timestamp"), datetime):
                failure["timestamp"] = failure["timestamp"].isoformat()
        for win in data.get("recent_wins", []):
            if isinstance(win.get("timestamp"), datetime):
                win["timestamp"] = win["timestamp"].isoformat()
        for followup in data.get("pending_followups", []):
            if isinstance(followup.get("due_date"), datetime):
                followup["due_date"] = followup["due_date"].isoformat()
            if isinstance(followup.get("created_at"), datetime):
                followup["created_at"] = followup["created_at"].isoformat()
        return json.dumps(data, ensure_ascii=False, indent=2)

    def _deserialize_state(self, raw: str) -> SessionState:
        data = json.loads(raw)
        for key in ("created_at", "updated_at"):
            if isinstance(data.get(key), str):
                data[key] = datetime.fromisoformat(data[key])
        for decision in data.get("last_decisions", []):
            if isinstance(decision.get("timestamp"), str):
                decision["timestamp"] = datetime.fromisoformat(decision["timestamp"])
        for failure in data.get("recent_failures", []):
            if isinstance(failure.get("timestamp"), str):
                failure["timestamp"] = datetime.fromisoformat(failure["timestamp"])
        for win in data.get("recent_wins", []):
            if isinstance(win.get("timestamp"), str):
                win["timestamp"] = datetime.fromisoformat(win["timestamp"])
        for followup in data.get("pending_followups", []):
            if isinstance(followup.get("due_date"), str) and followup["due_date"]:
                followup["due_date"] = datetime.fromisoformat(followup["due_date"])
            if isinstance(followup.get("created_at"), str):
                followup["created_at"] = datetime.fromisoformat(followup["created_at"])
        return SessionState(**data)

    async def save_state(self, state: SessionState) -> str:
        """
        Persist session state to disk.
        حفظ حالة الجلسة على القرص.
        """
        state.updated_at = datetime.now(timezone.utc)
        path = self._session_path(state.session_id)
        path.write_text(self._serialize_state(state), encoding="utf-8")
        self._current = state
        logger.info("تم حفظ حالة الجلسة: %s", state.session_id)
        return state.session_id

    async def restore_state(self, session_id: str = None) -> SessionState:
        """
        Restore session state. If no session_id, restore the latest.
        استعادة حالة الجلسة. إذا لم يُحدد معرف، يتم استعادة الأحدث.
        """
        if session_id:
            path = self._session_path(session_id)
            if path.exists():
                state = self._deserialize_state(path.read_text(encoding="utf-8"))
                self._current = state
                logger.info("تم استعادة الجلسة: %s", session_id)
                return state
            logger.warning("الجلسة غير موجودة: %s", session_id)
            return SessionState(session_id=session_id)

        # Find the latest session
        latest_path: Optional[Path] = None
        latest_mtime = 0.0
        for f in self.sessions_dir.glob("*.json"):
            mtime = f.stat().st_mtime
            if mtime > latest_mtime:
                latest_mtime = mtime
                latest_path = f

        if latest_path:
            state = self._deserialize_state(latest_path.read_text(encoding="utf-8"))
            self._current = state
            logger.info("تم استعادة أحدث جلسة: %s", state.session_id)
            return state

        logger.info("لا توجد جلسات سابقة، إنشاء جلسة جديدة")
        new_state = SessionState()
        await self.save_state(new_state)
        return new_state

    async def get_restore_prompt(self) -> str:
        """
        Generate a text prompt summarizing current state for a new AI session.
        توليد نص ملخّص للحالة الحالية لتغذية جلسة ذكاء اصطناعي جديدة.
        """
        state = self._current
        if not state:
            state = await self.restore_state()

        lines = [
            "# Session Restore — استعادة الجلسة",
            f"**Project**: {state.project}",
            f"**Session**: {state.session_id}",
            f"**Last Updated**: {state.updated_at.isoformat()}",
            "",
        ]

        if state.context_summary:
            lines.append(f"## Context (السياق)")
            lines.append(state.context_summary)
            if state.context_summary_ar:
                lines.append(state.context_summary_ar)
            lines.append("")

        if state.active_workstreams:
            lines.append("## Active Workstreams (مسارات العمل النشطة)")
            for ws in state.active_workstreams:
                lines.append(f"- {ws}")
            lines.append("")

        if state.last_decisions:
            lines.append("## Recent Decisions (القرارات الأخيرة)")
            for d in state.last_decisions[-5:]:
                ts = d.timestamp.strftime("%Y-%m-%d %H:%M")
                lines.append(f"- [{ts}] {d.decision}")
                if d.decision_ar:
                    lines.append(f"  {d.decision_ar}")
            lines.append("")

        if state.open_questions:
            lines.append("## Open Questions (أسئلة مفتوحة)")
            for q in state.open_questions:
                lines.append(f"- {q}")
            lines.append("")

        if state.recent_failures:
            lines.append("## Recent Failures (الإخفاقات الأخيرة)")
            for f in state.recent_failures[-3:]:
                lines.append(f"- {f.description}")
                if f.resolution:
                    lines.append(f"  Resolution: {f.resolution}")
            lines.append("")

        if state.recent_wins:
            lines.append("## Recent Wins (النجاحات الأخيرة)")
            for w in state.recent_wins[-3:]:
                lines.append(f"- {w.description}")
            lines.append("")

        pending = [fu for fu in state.pending_followups if not fu.completed]
        if pending:
            lines.append("## Pending Follow-ups (متابعات معلّقة)")
            for fu in pending:
                due = f" (due: {fu.due_date.strftime('%Y-%m-%d')})" if fu.due_date else ""
                lines.append(f"- {fu.task}{due}")
            lines.append("")

        lines.append("---")
        lines.append("Continue from this state. Prioritize pending follow-ups and open questions.")
        lines.append("استمر من هذه الحالة. أعطِ الأولوية للمتابعات المعلّقة والأسئلة المفتوحة.")

        return "\n".join(lines)

    async def add_decision(self, decision: str, context: str, decision_ar: str = "", made_by: str = "") -> None:
        """
        Record a decision in the current session.
        تسجيل قرار في الجلسة الحالية.
        """
        if not self._current:
            self._current = await self.restore_state()

        self._current.last_decisions.append(Decision(
            decision=decision,
            context=context,
            decision_ar=decision_ar,
            made_by=made_by,
        ))
        # Keep last 20 decisions
        if len(self._current.last_decisions) > 20:
            self._current.last_decisions = self._current.last_decisions[-20:]
        await self.save_state(self._current)
        logger.info("تم تسجيل قرار: %s", decision[:80])

    async def add_failure(self, description: str, context: str, description_ar: str = "", resolution: str = "") -> None:
        """
        Record a failure in the current session.
        تسجيل فشل في الجلسة الحالية.
        """
        if not self._current:
            self._current = await self.restore_state()

        self._current.recent_failures.append(Failure(
            description=description,
            context=context,
            description_ar=description_ar,
            resolution=resolution,
        ))
        if len(self._current.recent_failures) > 10:
            self._current.recent_failures = self._current.recent_failures[-10:]
        await self.save_state(self._current)
        logger.info("تم تسجيل فشل: %s", description[:80])

    async def add_win(self, description: str, context: str, description_ar: str = "") -> None:
        """
        Record a win in the current session.
        تسجيل نجاح في الجلسة الحالية.
        """
        if not self._current:
            self._current = await self.restore_state()

        self._current.recent_wins.append(Win(
            description=description,
            context=context,
            description_ar=description_ar,
        ))
        if len(self._current.recent_wins) > 10:
            self._current.recent_wins = self._current.recent_wins[-10:]
        await self.save_state(self._current)
        logger.info("تم تسجيل نجاح: %s", description[:80])

    async def add_followup(self, task: str, due_date: datetime = None, task_ar: str = "", assigned_to: str = "") -> None:
        """
        Add a pending follow-up task.
        إضافة مهمة متابعة معلّقة.
        """
        if not self._current:
            self._current = await self.restore_state()

        self._current.pending_followups.append(FollowUp(
            task=task,
            task_ar=task_ar,
            due_date=due_date,
            assigned_to=assigned_to,
        ))
        await self.save_state(self._current)
        logger.info("تم إضافة متابعة: %s", task[:80])

    async def complete_followup(self, task_substring: str) -> bool:
        """
        Mark a follow-up as completed by matching task text.
        تعليم متابعة كمكتملة عن طريق مطابقة نص المهمة.
        """
        if not self._current:
            self._current = await self.restore_state()

        task_lower = task_substring.lower()
        for fu in self._current.pending_followups:
            if task_lower in fu.task.lower() and not fu.completed:
                fu.completed = True
                await self.save_state(self._current)
                logger.info("تم إكمال متابعة: %s", fu.task[:80])
                return True
        return False

    async def set_workstreams(self, workstreams: list[str]) -> None:
        """
        Update active workstreams.
        تحديث مسارات العمل النشطة.
        """
        if not self._current:
            self._current = await self.restore_state()
        self._current.active_workstreams = workstreams
        await self.save_state(self._current)

    async def set_context(self, summary: str, summary_ar: str = "") -> None:
        """
        Update the context summary.
        تحديث ملخص السياق.
        """
        if not self._current:
            self._current = await self.restore_state()
        self._current.context_summary = summary
        self._current.context_summary_ar = summary_ar
        await self.save_state(self._current)

    async def add_question(self, question: str) -> None:
        """
        Add an open question.
        إضافة سؤال مفتوح.
        """
        if not self._current:
            self._current = await self.restore_state()
        if question not in self._current.open_questions:
            self._current.open_questions.append(question)
            if len(self._current.open_questions) > 15:
                self._current.open_questions = self._current.open_questions[-15:]
            await self.save_state(self._current)

    async def cleanup_old_sessions(self, days: int = 30) -> int:
        """
        Remove session files older than N days.
        حذف ملفات الجلسات الأقدم من N يوم.
        """
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        removed = 0
        for f in self.sessions_dir.glob("*.json"):
            try:
                data = json.loads(f.read_text(encoding="utf-8"))
                updated = data.get("updated_at", "")
                if isinstance(updated, str) and updated:
                    ts = datetime.fromisoformat(updated)
                    if ts < cutoff:
                        f.unlink()
                        removed += 1
            except Exception as exc:
                logger.warning("فشل معالجة ملف الجلسة %s: %s", f.name, exc)
        logger.info("تم حذف %d جلسة قديمة (أقدم من %d يوم)", removed, days)
        return removed

    async def list_sessions(self, limit: int = 20) -> list[dict[str, Any]]:
        """
        List recent sessions with basic info.
        عرض الجلسات الأخيرة مع معلومات أساسية.
        """
        sessions: list[dict[str, Any]] = []
        for f in sorted(self.sessions_dir.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True):
            if len(sessions) >= limit:
                break
            try:
                data = json.loads(f.read_text(encoding="utf-8"))
                sessions.append({
                    "session_id": data.get("session_id", f.stem),
                    "project": data.get("project", ""),
                    "updated_at": data.get("updated_at", ""),
                    "workstreams": data.get("active_workstreams", []),
                    "decisions_count": len(data.get("last_decisions", [])),
                    "followups_pending": sum(
                        1 for fu in data.get("pending_followups", [])
                        if not fu.get("completed", False)
                    ),
                })
            except Exception:
                continue
        return sessions


# ---------------------------------------------------------------------------
# Global singleton
# ---------------------------------------------------------------------------

session_continuity = SessionContinuity()
