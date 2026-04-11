from __future__ import annotations

from typing import Any, Dict

from app.openclaw.durable_flow import DurableTaskFlow
from app.openclaw.hooks import before_agent_reply
from app.openclaw.plugins.salesforce_agentforce_plugin import SalesforceAgentforcePlugin
from app.openclaw.plugins.whatsapp_plugin import WhatsAppCloudPlugin
from app.openclaw.plugins.voice_plugin import VoiceAgentsPlugin
from app.services.email_service import email_service
from app.services.linkedin_service import linkedin_service
from app.services.predictive_revenue_service import predictive_revenue_service
from app.services.signal_selling_service import signal_selling_service


class ProspectingDurableFlow:
    """Phase-1 durable flow for multi-channel prospecting."""

    def __init__(self) -> None:
        self.salesforce = SalesforceAgentforcePlugin()
        self.whatsapp = WhatsAppCloudPlugin()
        self.voice = VoiceAgentsPlugin()

    async def run(self, tenant_id: str, deal: Dict[str, Any]) -> Dict[str, Any]:
        flow = DurableTaskFlow(flow_name="prospecting_crew_v1", tenant_id=tenant_id)
        flow.checkpoint("start", {"deal": deal, "status": "running"})

        account_360 = await self.salesforce.get_account_360(deal.get("company_name", "Unknown"))
        flow.checkpoint("salesforce_grounding", {"account_360": account_360})

        signals = signal_selling_service.aggregate_signals(
            web_signals=deal.get("web_signals", []),
            email_signals=deal.get("email_signals", []),
            call_signals=deal.get("call_signals", []),
            linkedin_signals=deal.get("linkedin_signals", []),
        )
        lead_score = predictive_revenue_service.score_signal_based_lead(deal, signals.get("top_signals", []))
        flow.checkpoint("signal_scoring", {"signals": signals, "signal_score": lead_score})

        approval_payload = {"approval_token": deal.get("approval_token", "")}
        for action in ["send_whatsapp", "send_email", "send_linkedin", "trigger_voice_call", "sync_salesforce"]:
            gate = before_agent_reply(action=action, payload=approval_payload, tenant_id=tenant_id)
            if not gate["allowed"]:
                flow.checkpoint("blocked", {"status": "blocked", "action": action, "reason": gate["reason"]})
                return flow.as_dict()

        wa = await self.whatsapp.send_message(
            phone=deal.get("phone", ""),
            text=deal.get("outreach_message", "مرحبا، نقدر نساعدكم في تسريع الإيرادات عبر Dealix."),
        )
        flow.checkpoint("whatsapp_sent", {"whatsapp": wa})

        email = email_service.send_outreach_email(
            company_name=deal.get("company_name", "Unknown"),
            contact_person=deal.get("decision_maker", "Decision Maker"),
        )
        flow.checkpoint("email_sent", {"email": email})

        linkedin = linkedin_service.send_connection_request(
            company_name=deal.get("company_name", "Unknown"),
            person_name=deal.get("decision_maker", "Sales Director"),
        )
        flow.checkpoint("linkedin_sent", {"linkedin": linkedin})

        voice = await self.voice.trigger_call(
            company_name=deal.get("company_name", "Unknown"),
            phone=deal.get("phone", ""),
            objective="meeting_booking_and_objection_handling",
        )
        flow.checkpoint("voice_triggered", {"voice": voice})

        await self.salesforce.sync_opportunity({**deal, "intent_score": lead_score, "deal_stage": "QUALIFIED"})
        flow.checkpoint("salesforce_synced", {"status": "completed"})
        return flow.as_dict()


prospecting_durable_flow = ProspectingDurableFlow()
