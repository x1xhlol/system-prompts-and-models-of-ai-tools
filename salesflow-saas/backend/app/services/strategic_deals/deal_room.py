"""
Deal Room — Central workspace for managing an active B2B deal through all stages.
غرفة الصفقة: مساحة العمل المركزية لإدارة صفقة B2B عبر جميع المراحل
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategic_deal import StrategicDeal, CompanyProfile, DealStatus
from app.services.llm.provider import get_llm

logger = logging.getLogger("dealix.strategic_deals.deal_room")


# ── Room Stages ─────────────────────────────────────────────────────────────

ROOM_STAGES = [
    "discovery",
    "qualification",
    "proposal",
    "negotiation",
    "legal",
    "approval",
    "closed_won",
    "closed_lost",
]

STAGE_LABELS_AR = {
    "discovery": "اكتشاف",
    "qualification": "تأهيل",
    "proposal": "مقترح",
    "negotiation": "تفاوض",
    "legal": "مراجعة قانونية",
    "approval": "موافقة",
    "closed_won": "تمت بنجاح",
    "closed_lost": "لم تتم",
}


# ── Pydantic Models ─────────────────────────────────────────────────────────


class ConcessionRecord(BaseModel):
    """Record of a single concession given or received."""
    what: str
    value_sar: float = 0.0
    direction: str = "given"  # given or received
    timestamp: str = ""
    rationale: str = ""


class ApprovalRequest(BaseModel):
    """An approval request within a deal room."""
    approval_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    action: str
    details: str = ""
    requested_by: str = "ai_agent"
    requested_at: str = ""
    status: str = "pending"  # pending, granted, denied
    decided_by: str = ""
    decided_at: str = ""
    notes: str = ""


class AuditEntry(BaseModel):
    """Immutable audit log entry."""
    timestamp: str
    actor: str  # user_id or "ai_agent"
    action: str
    details: str = ""
    metadata: dict = Field(default_factory=dict)


class RoomMessage(BaseModel):
    """A message within the deal room conversation."""
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    direction: str  # inbound or outbound
    channel: str  # email, whatsapp, internal
    content: str
    sender: str = ""
    timestamp: str = ""
    metadata: dict = Field(default_factory=dict)


class DealRoom(BaseModel):
    """
    Central workspace for managing a B2B deal.
    غرفة الصفقة: مساحة العمل المركزية لصفقة B2B
    """
    room_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    deal_id: str
    tenant_id: str

    # Parties
    our_twin_id: str = ""
    their_profile: dict = Field(default_factory=dict)

    # Deal context
    deal_type: str = ""
    hypothesis: str = ""  # Why this deal makes sense (Arabic)
    mutual_value: dict = Field(
        default_factory=lambda: {"us": [], "them": []},
    )

    # Negotiation state
    current_offer: dict = Field(default_factory=dict)
    their_last_response: dict = Field(default_factory=dict)
    concessions_made: list[ConcessionRecord] = Field(default_factory=list)
    concessions_received: list[ConcessionRecord] = Field(default_factory=list)
    batna: dict = Field(default_factory=dict)  # Best alternative if deal fails
    walk_away_threshold: dict = Field(default_factory=dict)

    # Conversation
    messages: list[RoomMessage] = Field(default_factory=list)
    channel: str = "email"

    # Status
    stage: str = "discovery"
    blockers: list[str] = Field(default_factory=list)
    next_action: str = ""
    next_action_ar: str = ""

    # Governance
    approvals_pending: list[ApprovalRequest] = Field(default_factory=list)
    approvals_granted: list[ApprovalRequest] = Field(default_factory=list)
    red_line_violations: list[dict] = Field(default_factory=list)
    audit_log: list[AuditEntry] = Field(default_factory=list)

    # Metadata
    created_at: str = ""
    updated_at: str = ""


# ── Service ─────────────────────────────────────────────────────────────────


class DealRoomService:
    """
    Manages DealRoom lifecycle: creation, stage transitions, messaging, governance.
    إدارة دورة حياة غرفة الصفقة: الإنشاء، والانتقال بين المراحل، والرسائل، والحوكمة
    """

    def __init__(self):
        self.llm = get_llm()

    # ── Create Room ─────────────────────────────────────────────────────────

    async def create_room(
        self,
        deal_id: str,
        our_twin_id: str,
        their_profile: dict,
        db: AsyncSession,
    ) -> DealRoom:
        """
        Create a new deal room linked to a StrategicDeal.
        إنشاء غرفة صفقة جديدة مرتبطة بصفقة استراتيجية
        """
        deal_result = await db.execute(
            select(StrategicDeal).where(StrategicDeal.id == deal_id)
        )
        deal = deal_result.scalar_one_or_none()
        if not deal:
            raise ValueError(f"الصفقة غير موجودة: {deal_id}")

        now_iso = datetime.now(timezone.utc).isoformat()
        room = DealRoom(
            deal_id=str(deal.id),
            tenant_id=str(deal.tenant_id),
            our_twin_id=our_twin_id,
            their_profile=their_profile,
            deal_type=deal.deal_type or "",
            channel=deal.channel or "email",
            stage="discovery",
            next_action="research_target",
            next_action_ar="بحث عن الطرف الآخر وتحليل احتياجاته",
            created_at=now_iso,
            updated_at=now_iso,
            audit_log=[
                AuditEntry(
                    timestamp=now_iso,
                    actor="ai_agent",
                    action="room_created",
                    details=f"غرفة صفقة جديدة — نوع: {deal.deal_type or 'غير محدد'}",
                ),
            ],
        )

        # Persist room data on the deal
        history = list(deal.negotiation_history or [])
        history.append({
            "round": 0,
            "action": "room_created",
            "room_id": room.room_id,
            "timestamp": now_iso,
        })
        deal.negotiation_history = history

        # Store room in proposed_terms as a nested structure
        existing_terms = dict(deal.proposed_terms or {})
        existing_terms["_deal_room"] = room.model_dump(mode="json")
        deal.proposed_terms = existing_terms
        await db.flush()

        logger.info("Created deal room %s for deal %s", room.room_id, deal_id)
        return room

    # ── Load Room ───────────────────────────────────────────────────────────

    async def _load_room(self, room_id: str, db: AsyncSession) -> tuple[DealRoom, StrategicDeal]:
        """Load a DealRoom and its parent StrategicDeal."""
        # Scan deals for the room
        all_deals = await db.execute(select(StrategicDeal))
        for deal in all_deals.scalars():
            terms = deal.proposed_terms or {}
            room_data = terms.get("_deal_room")
            if room_data and room_data.get("room_id") == room_id:
                return DealRoom(**room_data), deal
        raise ValueError(f"غرفة الصفقة غير موجودة: {room_id}")

    async def _persist_room(self, room: DealRoom, deal: StrategicDeal, db: AsyncSession):
        """Persist the room state back onto the deal."""
        room.updated_at = datetime.now(timezone.utc).isoformat()
        existing_terms = dict(deal.proposed_terms or {})
        existing_terms["_deal_room"] = room.model_dump(mode="json")
        deal.proposed_terms = existing_terms
        await db.flush()

    # ── Update Stage ────────────────────────────────────────────────────────

    async def update_stage(
        self,
        room_id: str,
        new_stage: str,
        reason: str,
        db: AsyncSession,
    ):
        """
        Transition the deal room to a new stage with audit logging.
        نقل غرفة الصفقة إلى مرحلة جديدة مع تسجيل في سجل المراجعة
        """
        if new_stage not in ROOM_STAGES:
            raise ValueError(f"مرحلة غير صالحة: {new_stage}. المراحل المتاحة: {', '.join(ROOM_STAGES)}")

        room, deal = await self._load_room(room_id, db)
        old_stage = room.stage

        # Validate forward-only transition (except to closed_lost which can happen from any stage)
        if new_stage != "closed_lost":
            old_idx = ROOM_STAGES.index(old_stage) if old_stage in ROOM_STAGES else 0
            new_idx = ROOM_STAGES.index(new_stage)
            if new_idx < old_idx:
                raise ValueError(
                    f"لا يمكن الرجوع من {STAGE_LABELS_AR.get(old_stage, old_stage)} "
                    f"إلى {STAGE_LABELS_AR.get(new_stage, new_stage)}"
                )

        room.stage = new_stage
        now_iso = datetime.now(timezone.utc).isoformat()
        room.audit_log.append(
            AuditEntry(
                timestamp=now_iso,
                actor="ai_agent",
                action="stage_changed",
                details=f"انتقال من {STAGE_LABELS_AR.get(old_stage, old_stage)} إلى {STAGE_LABELS_AR.get(new_stage, new_stage)}: {reason}",
                metadata={"old_stage": old_stage, "new_stage": new_stage},
            )
        )

        # Sync deal status
        stage_to_status = {
            "discovery": DealStatus.DISCOVERY.value,
            "qualification": DealStatus.DISCOVERY.value,
            "proposal": DealStatus.OUTREACH.value,
            "negotiation": DealStatus.NEGOTIATING.value,
            "legal": DealStatus.TERM_SHEET.value,
            "approval": DealStatus.DUE_DILIGENCE.value,
            "closed_won": DealStatus.CLOSED_WON.value,
            "closed_lost": DealStatus.CLOSED_LOST.value,
        }
        mapped_status = stage_to_status.get(new_stage)
        if mapped_status:
            deal.status = mapped_status
            if new_stage in ("closed_won", "closed_lost"):
                deal.closed_at = datetime.now(timezone.utc)

        await self._persist_room(room, deal, db)
        logger.info("Room %s stage: %s -> %s (%s)", room_id, old_stage, new_stage, reason)

    # ── Add Message ─────────────────────────────────────────────────────────

    async def add_message(
        self,
        room_id: str,
        message: str,
        direction: str,
        channel: str,
        db: AsyncSession,
    ):
        """
        Record a message in the deal room conversation.
        تسجيل رسالة في محادثة غرفة الصفقة
        """
        room, deal = await self._load_room(room_id, db)
        now_iso = datetime.now(timezone.utc).isoformat()

        room.messages.append(
            RoomMessage(
                direction=direction,
                channel=channel,
                content=message,
                sender="ai_agent" if direction == "outbound" else "counterparty",
                timestamp=now_iso,
            )
        )

        if direction == "inbound":
            room.their_last_response = {
                "content": message,
                "channel": channel,
                "timestamp": now_iso,
            }

        room.audit_log.append(
            AuditEntry(
                timestamp=now_iso,
                actor="ai_agent" if direction == "outbound" else "counterparty",
                action=f"message_{direction}",
                details=message[:200],
                metadata={"channel": channel},
            )
        )

        await self._persist_room(room, deal, db)
        logger.info("Added %s message to room %s via %s", direction, room_id, channel)

    # ── Record Concession ───────────────────────────────────────────────────

    async def record_concession(
        self,
        room_id: str,
        what: str,
        value: float,
        db: AsyncSession,
    ):
        """
        Record a concession made during negotiation.
        تسجيل تنازل تم خلال التفاوض
        """
        room, deal = await self._load_room(room_id, db)
        now_iso = datetime.now(timezone.utc).isoformat()

        record = ConcessionRecord(
            what=what,
            value_sar=value,
            direction="given",
            timestamp=now_iso,
        )
        room.concessions_made.append(record)

        room.audit_log.append(
            AuditEntry(
                timestamp=now_iso,
                actor="ai_agent",
                action="concession_made",
                details=f"تنازل: {what} (قيمة: {value:,.0f} ريال)",
                metadata={"value_sar": value},
            )
        )

        await self._persist_room(room, deal, db)
        logger.info("Recorded concession in room %s: %s (%.0f SAR)", room_id, what, value)

    # ── Check Red Lines ─────────────────────────────────────────────────────

    async def check_red_lines(
        self,
        room_id: str,
        proposed_terms: dict,
        db: AsyncSession,
    ) -> list[str]:
        """
        Check proposed terms against the company's red lines.
        التحقق من الشروط المقترحة مقابل الخطوط الحمراء للشركة
        """
        room, deal = await self._load_room(room_id, db)

        # Load the company twin to get red lines
        from app.services.strategic_deals.company_twin import CompanyTwinBuilder
        builder = CompanyTwinBuilder()
        twin = None

        if room.our_twin_id:
            twin = await builder.get_twin_by_id(room.our_twin_id, db)

        if not twin:
            # Try loading by company_id from the deal initiator
            if deal.initiator_profile_id:
                twin = await builder.get_twin(str(deal.initiator_profile_id), db)

        red_lines = twin.red_lines if twin else []
        if not red_lines:
            return []

        violations: list[str] = []
        terms_text = str(proposed_terms).lower()

        # Static keyword check
        keyword_checks = {
            "حصرية": "exclusivity",
            "حقوق ملكية": "equity",
            "ضمان": "guarantee",
            "تعويض": "compensation",
            "غرامة": "penalty",
        }

        for red_line in red_lines:
            red_line_lower = red_line.lower()
            # Direct keyword match
            if red_line_lower in terms_text:
                violations.append(f"خط أحمر: {red_line}")
                continue
            # Check Arabic keywords
            for ar_kw, en_kw in keyword_checks.items():
                if ar_kw in red_line_lower and en_kw in terms_text:
                    violations.append(f"خط أحمر: {red_line}")
                    break

        # If there are potential concerns, use LLM for deeper analysis
        if not violations and red_lines:
            system_prompt = """أنت مراجع عقود سعودي. تحقق من الشروط المقترحة مقابل الخطوط الحمراء.

أعد النتائج بصيغة JSON:
{
    "violations": ["وصف الانتهاك 1", "وصف الانتهاك 2"],
    "warnings": ["تحذير 1"]
}

إذا لم يكن هناك انتهاكات، أعد قوائم فارغة."""

            context = (
                f"الخطوط الحمراء:\n" + "\n".join(f"- {rl}" for rl in red_lines)
                + f"\n\nالشروط المقترحة:\n{str(proposed_terms)}"
            )

            try:
                llm_response = await self.llm.complete(
                    system_prompt=system_prompt,
                    user_message=context,
                    json_mode=True,
                    temperature=0.1,
                )
                result = llm_response.parse_json()
                if result and result.get("violations"):
                    violations.extend(result["violations"])
            except Exception as exc:
                logger.warning("LLM red-line check failed: %s", exc)

        # Record violations
        if violations:
            now_iso = datetime.now(timezone.utc).isoformat()
            for v in violations:
                room.red_line_violations.append({
                    "violation": v,
                    "proposed_terms": proposed_terms,
                    "timestamp": now_iso,
                })
            room.audit_log.append(
                AuditEntry(
                    timestamp=now_iso,
                    actor="ai_agent",
                    action="red_line_violation",
                    details=f"تم اكتشاف {len(violations)} انتهاك للخطوط الحمراء",
                    metadata={"violations": violations},
                )
            )
            await self._persist_room(room, deal, db)

        logger.info("Red line check for room %s: %d violations", room_id, len(violations))
        return violations

    # ── Request Approval ────────────────────────────────────────────────────

    async def request_approval(
        self,
        room_id: str,
        action: str,
        details: str,
        db: AsyncSession,
    ) -> str:
        """
        Create an approval request that pauses AI action until a human decides.
        إنشاء طلب موافقة يوقف عمل الذكاء الاصطناعي حتى يقرر إنسان
        """
        room, deal = await self._load_room(room_id, db)
        now_iso = datetime.now(timezone.utc).isoformat()

        approval = ApprovalRequest(
            action=action,
            details=details,
            requested_at=now_iso,
        )
        room.approvals_pending.append(approval)

        room.blockers.append(f"بانتظار موافقة على: {action}")
        room.audit_log.append(
            AuditEntry(
                timestamp=now_iso,
                actor="ai_agent",
                action="approval_requested",
                details=f"طلب موافقة: {action} — {details}",
                metadata={"approval_id": approval.approval_id},
            )
        )

        await self._persist_room(room, deal, db)
        logger.info("Approval requested in room %s: %s (id=%s)", room_id, action, approval.approval_id)
        return approval.approval_id

    # ── Grant Approval ──────────────────────────────────────────────────────

    async def grant_approval(
        self,
        room_id: str,
        approval_id: str,
        user_id: str,
        db: AsyncSession,
    ):
        """
        Grant a pending approval request.
        منح موافقة على طلب معلق
        """
        room, deal = await self._load_room(room_id, db)
        now_iso = datetime.now(timezone.utc).isoformat()

        granted = None
        remaining_pending = []
        for req in room.approvals_pending:
            if req.approval_id == approval_id:
                req.status = "granted"
                req.decided_by = user_id
                req.decided_at = now_iso
                granted = req
            else:
                remaining_pending.append(req)

        if not granted:
            raise ValueError(f"طلب الموافقة غير موجود: {approval_id}")

        room.approvals_pending = remaining_pending
        room.approvals_granted.append(granted)

        # Remove related blocker
        blocker_prefix = f"بانتظار موافقة على: {granted.action}"
        room.blockers = [b for b in room.blockers if b != blocker_prefix]

        room.audit_log.append(
            AuditEntry(
                timestamp=now_iso,
                actor=user_id,
                action="approval_granted",
                details=f"تمت الموافقة على: {granted.action}",
                metadata={"approval_id": approval_id},
            )
        )

        await self._persist_room(room, deal, db)
        logger.info("Approval %s granted by %s in room %s", approval_id, user_id, room_id)

    # ── Deal Summary ────────────────────────────────────────────────────────

    async def get_deal_summary(
        self,
        room_id: str,
        db: AsyncSession,
    ) -> dict:
        """
        Generate an Arabic summary of the deal room status.
        إنشاء ملخص عربي لحالة غرفة الصفقة
        """
        room, deal = await self._load_room(room_id, db)

        # Gather data for LLM summary
        msg_count = len(room.messages)
        inbound = sum(1 for m in room.messages if m.direction == "inbound")
        outbound = msg_count - inbound
        concessions_given = len(room.concessions_made)
        concessions_got = len(room.concessions_received)
        total_concession_value = sum(c.value_sar for c in room.concessions_made)
        pending_approvals = len(room.approvals_pending)
        violations = len(room.red_line_violations)

        stage_ar = STAGE_LABELS_AR.get(room.stage, room.stage)
        their_name = room.their_profile.get("company_name", room.their_profile.get("name", "الطرف الآخر"))

        summary = {
            "room_id": room.room_id,
            "deal_id": room.deal_id,
            "stage": room.stage,
            "stage_ar": stage_ar,
            "their_name": their_name,
            "deal_type": room.deal_type,
            "channel": room.channel,
            "statistics": {
                "total_messages": msg_count,
                "inbound_messages": inbound,
                "outbound_messages": outbound,
                "concessions_given": concessions_given,
                "concessions_received": concessions_got,
                "total_concession_value_sar": total_concession_value,
                "pending_approvals": pending_approvals,
                "red_line_violations": violations,
            },
            "blockers": room.blockers,
            "next_action": room.next_action,
            "next_action_ar": room.next_action_ar,
            "current_offer": room.current_offer,
            "their_last_response": room.their_last_response,
            "summary_ar": (
                f"صفقة مع {their_name} — المرحلة: {stage_ar}\n"
                f"عدد الرسائل: {msg_count} ({inbound} واردة، {outbound} صادرة)\n"
                f"التنازلات المقدمة: {concessions_given} (بقيمة {total_concession_value:,.0f} ريال)\n"
                + (f"موافقات معلقة: {pending_approvals}\n" if pending_approvals else "")
                + (f"تحذير: {violations} انتهاك للخطوط الحمراء\n" if violations else "")
                + (f"الخطوة التالية: {room.next_action_ar}" if room.next_action_ar else "")
            ),
        }

        logger.info("Generated deal summary for room %s", room_id)
        return summary

    # ── Get Rooms ───────────────────────────────────────────────────────────

    async def get_rooms(
        self,
        tenant_id: str,
        stage: Optional[str] = None,
        db: AsyncSession = None,
    ) -> list[DealRoom]:
        """
        List all deal rooms for a tenant, optionally filtered by stage.
        عرض جميع غرف الصفقات لمستأجر معين مع إمكانية الفلترة بالمرحلة
        """
        query = select(StrategicDeal).where(
            StrategicDeal.tenant_id == tenant_id
        )
        result = await db.execute(query)
        deals = result.scalars().all()

        rooms: list[DealRoom] = []
        for deal in deals:
            terms = deal.proposed_terms or {}
            room_data = terms.get("_deal_room")
            if not room_data:
                continue
            try:
                room = DealRoom(**room_data)
                if stage and room.stage != stage:
                    continue
                rooms.append(room)
            except Exception as exc:
                logger.warning("Failed to deserialize room from deal %s: %s", deal.id, exc)

        logger.info(
            "Retrieved %d deal rooms for tenant %s (stage=%s)",
            len(rooms), tenant_id, stage or "all",
        )
        return rooms
