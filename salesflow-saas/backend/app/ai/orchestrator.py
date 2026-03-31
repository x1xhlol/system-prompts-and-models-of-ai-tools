"""
Orchestrator — THE BRAIN of Dealix.
Controls the full lead lifecycle: Lead → Qualify → Nurture → Book → Close.
Decides when to use which agent, when to escalate to humans, and when to move stages.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.agent_router import AgentRouter
from app.ai.llm_provider import LLMProvider
from app.services.lead_service import LeadService
from app.services.deal_service import DealService
from app.services.meeting_service import MeetingService
from app.services.notification_service import NotificationService
from app.services.trust_score_service import TrustScoreService


# Lead lifecycle state machine
LEAD_STATES = {
    "new": {
        "actions": ["qualify", "enrich"],
        "next_states": ["contacted", "lost"],
        "auto_agent": "lead_qualification",
    },
    "contacted": {
        "actions": ["nurture", "follow_up", "qualify"],
        "next_states": ["qualified", "lost"],
        "auto_agent": "outreach_writer",
    },
    "qualified": {
        "actions": ["book_meeting", "send_proposal"],
        "next_states": ["converted", "contacted", "lost"],
        "auto_agent": "meeting_booking",
    },
    "converted": {
        "actions": ["create_deal", "prepare_presentation"],
        "next_states": [],
        "auto_agent": None,
    },
    "lost": {
        "actions": ["re_engage"],
        "next_states": ["new"],
        "auto_agent": None,
    },
}


class Orchestrator:
    """
    Central orchestration engine that automates the Lead-to-Meeting pipeline.

    The Orchestrator:
    1. Receives events (new lead, message, call, etc.)
    2. Determines the current state of the lead
    3. Decides which agent(s) to invoke
    4. Executes the appropriate action
    5. Moves the lead to the next state
    6. Notifies humans when needed
    """

    def __init__(self, db: AsyncSession, llm: LLMProvider = None):
        self.db = db
        self.llm = llm or LLMProvider()
        self.router = AgentRouter(db=db, llm=self.llm)
        self.leads = LeadService(db)
        self.deals = DealService(db)
        self.meetings = MeetingService(db)
        self.notifications = NotificationService(db)
        self.trust_scores = TrustScoreService(db)

    # ── Process New Lead ──────────────────────────

    async def process_new_lead(self, tenant_id: str, lead_id: str) -> dict:
        """
        Full automated pipeline for a new lead:
        1. Calculate trust score
        2. AI qualification
        3. If qualified → auto-assign + outreach
        4. If hot → book meeting immediately
        """
        actions_taken = []

        # Step 1: Trust Score
        trust = await self.trust_scores.calculate_lead_score(tenant_id, lead_id)
        actions_taken.append({"action": "trust_score", "result": trust})

        lead = await self.leads.get_lead(tenant_id, lead_id)
        if not lead:
            return {"error": "Lead not found", "actions": actions_taken}

        # Step 2: AI Qualification
        qual_result = await self.router.route(
            event_type="lead.created",
            event_data={
                "lead": lead,
                "trust_score": trust,
            },
            tenant_id=tenant_id,
            lead_id=lead_id,
        )
        actions_taken.append({"action": "ai_qualification", "result": qual_result})

        # Extract score from AI response
        ai_score = 50  # default
        if qual_result.get("results"):
            output = qual_result["results"][0].get("output", {})
            ai_score = output.get("qualification_score", output.get("score", 50))
            if isinstance(ai_score, str):
                try:
                    ai_score = int(ai_score)
                except (ValueError, TypeError):
                    ai_score = 50

        # Step 3: Update lead
        await self.leads.qualify_lead(tenant_id, lead_id, ai_score)

        # Step 4: Auto-assign
        if ai_score >= 40:
            assign_result = await self.leads.auto_assign_round_robin(tenant_id, lead_id)
            actions_taken.append({"action": "auto_assign", "result": assign_result})

            if assign_result and assign_result.get("assigned_to"):
                await self.notifications.notify_new_lead(
                    tenant_id, assign_result["assigned_to"], lead["full_name"]
                )

        # Step 5: Hot lead → immediate meeting booking attempt
        if ai_score >= 80 and trust.get("trust_score", 0) >= 60:
            outreach = await self.router.route(
                event_type="lead.meeting_ready",
                event_data={"lead": lead, "score": ai_score},
                tenant_id=tenant_id,
                lead_id=lead_id,
            )
            actions_taken.append({"action": "meeting_booking_attempt", "result": outreach})

        # Step 6: Warm lead → nurture sequence
        elif ai_score >= 40:
            nurture = await self.router.route(
                event_type="lead.qualified",
                event_data={"lead": lead, "score": ai_score},
                tenant_id=tenant_id,
                lead_id=lead_id,
            )
            actions_taken.append({"action": "nurture_outreach", "result": nurture})

        return {
            "lead_id": lead_id,
            "trust_score": trust.get("trust_score", 0),
            "ai_score": ai_score,
            "classification": trust.get("classification", "cold"),
            "actions_taken": actions_taken,
            "next_state": LEAD_STATES.get(lead.get("status", "new"), {}),
        }

    # ── Handle Inbound Message ────────────────────

    async def handle_inbound_message(
        self,
        tenant_id: str,
        lead_id: str,
        message: str,
        channel: str = "whatsapp",
        language: str = "ar",
    ) -> dict:
        """
        Process an inbound message from a lead:
        1. Detect language and intent
        2. Route to appropriate conversation agent
        3. Check for buying signals
        4. Auto-escalate if needed
        """
        lead = await self.leads.get_lead(tenant_id, lead_id)
        if not lead:
            return {"error": "Lead not found"}

        # Determine event type based on language and channel
        if language == "ar":
            event_type = "message.inbound.whatsapp.ar"
        else:
            event_type = "message.inbound.whatsapp.en"

        # Execute conversation agent
        result = await self.router.route(
            event_type=event_type,
            event_data={
                "lead": lead,
                "message": message,
                "channel": channel,
                "language": language,
            },
            tenant_id=tenant_id,
            lead_id=lead_id,
        )

        # Check for meeting readiness in response
        if result.get("results"):
            output = result["results"][0].get("output", {})
            intent = output.get("intent", output.get("detected_intent", ""))

            if intent in ["book_meeting", "schedule", "meeting", "demo"]:
                # Trigger meeting booking
                booking = await self.router.route(
                    event_type="meeting.requested",
                    event_data={"lead": lead, "conversation_output": output},
                    tenant_id=tenant_id,
                    lead_id=lead_id,
                )
                result["meeting_booking"] = booking

            elif intent in ["pricing", "quote", "proposal"]:
                # Trigger proposal generation
                proposal = await self.router.route(
                    event_type="deal.proposal_needed",
                    event_data={"lead": lead, "conversation_output": output},
                    tenant_id=tenant_id,
                    lead_id=lead_id,
                )
                result["proposal"] = proposal

        # Handle escalations
        if result.get("escalations"):
            for esc in result["escalations"]:
                if lead.get("assigned_to"):
                    await self.notifications.notify_escalation(
                        tenant_id,
                        lead["assigned_to"],
                        f"تصعيد من {lead['full_name']}: {esc['reason']}",
                    )

        return result

    # ── Process Deal Stage Change ─────────────────

    async def process_deal_update(
        self, tenant_id: str, deal_id: str, new_stage: str
    ) -> dict:
        """Handle deal stage transitions with automated actions."""
        deal = await self.deals.get_deal(tenant_id, deal_id)
        if not deal:
            return {"error": "Deal not found"}

        actions = []

        if new_stage == "proposal":
            # Auto-generate proposal
            result = await self.router.route(
                event_type="deal.proposal_needed",
                event_data={"deal": deal},
                tenant_id=tenant_id,
            )
            actions.append({"action": "generate_proposal", "result": result})

        elif new_stage == "closed_won":
            # Revenue attribution + commission
            result = await self.router.route(
                event_type="deal.closed_won",
                event_data={"deal": deal},
                tenant_id=tenant_id,
            )
            actions.append({"action": "revenue_attribution", "result": result})

            # Notify
            if deal.get("assigned_to"):
                await self.notifications.notify_deal_won(
                    tenant_id,
                    deal["assigned_to"],
                    deal["title"],
                    deal.get("value", 0),
                )

        await self.deals.move_stage(tenant_id, deal_id, new_stage)
        return {"deal_id": deal_id, "new_stage": new_stage, "actions": actions}

    # ── Prepare Meeting ───────────────────────────

    async def prepare_meeting(self, tenant_id: str, meeting_id: str) -> dict:
        """
        AI-powered meeting preparation:
        1. Company research
        2. Sector strategy
        3. Talking points
        4. Predicted objections
        5. Recommended presentation
        """
        package = await self.meetings.prepare_meeting_package(tenant_id, meeting_id)
        if not package or not package.get("lead"):
            return {"error": "Meeting or lead not found"}

        lead = package["lead"]

        # Get sector strategy
        strategy = await self.router.route(
            event_type="meeting.prep_needed",
            event_data={
                "lead": lead,
                "meeting": package,
            },
            tenant_id=tenant_id,
            lead_id=lead.get("id"),
        )

        package["ai_preparation"] = strategy
        package["status"] = "ready"

        return package

    # ── Daily Automation ──────────────────────────

    async def run_daily_automation(self, tenant_id: str) -> dict:
        """
        Daily automated tasks:
        1. Score unscored leads
        2. Follow up on stale leads
        3. Remind about upcoming meetings
        4. Generate management summary
        """
        results = {}

        # Score all unscored leads
        score_result = await self.trust_scores.score_all_leads(tenant_id)
        results["scoring"] = score_result

        # Generate daily summary
        summary = await self.router.route(
            event_type="report.daily",
            event_data={"tenant_id": tenant_id, "type": "daily"},
            tenant_id=tenant_id,
        )
        results["summary"] = summary

        return results

    # ── Status ────────────────────────────────────

    def get_lifecycle_states(self) -> dict:
        return LEAD_STATES

    def get_supported_events(self) -> list:
        return self.router.get_event_types()
