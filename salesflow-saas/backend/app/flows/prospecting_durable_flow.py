"""
Prospecting Durable Flow v2.0 — Multi-Channel Autonomous Prospecting
=====================================================================
Enhanced version that integrates with the new agent system.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any, Dict

logger = logging.getLogger("dealix.flows.prospecting")


class ProspectingDurableFlow:
    """Phase-1 durable flow for multi-channel prospecting — v2.0."""

    async def run(self, tenant_id: str, deal: Dict[str, Any], db=None) -> Dict[str, Any]:
        """
        Multi-channel prospecting flow:
        1. Qualify the lead via AI agent
        2. Score with signal intelligence
        3. Send WhatsApp outreach
        4. Send email outreach
        5. LinkedIn connection
        6. Voice call (if high score)
        7. Sync to CRM
        """
        flow_result = {
            "flow": "prospecting_crew_v2",
            "tenant_id": tenant_id,
            "run_id": str(uuid.uuid4()),
            "deal": deal.get("company_name", "Unknown"),
            "steps": [],
            "status": "running",
        }

        # Step 1: Qualify via AI agent pipeline
        try:
            if db:
                from app.services.agents.autonomous_pipeline import AutonomousPipeline
                pipeline = AutonomousPipeline(db)
                pipeline_result = await pipeline.process_new_lead(
                    tenant_id=tenant_id,
                    lead_data={
                        "lead_id": deal.get("lead_id", ""),
                        "full_name": deal.get("decision_maker", ""),
                        "contact_phone": deal.get("phone", ""),
                        "contact_email": deal.get("email", ""),
                        "company_name": deal.get("company_name", ""),
                        "sector": deal.get("industry", ""),
                        "city": deal.get("city", "Riyadh"),
                        "source": deal.get("source", "prospecting_flow"),
                    }
                )
                flow_result["steps"].append({
                    "step": "ai_qualification",
                    "status": "completed",
                    "score": pipeline_result.get("qualification_score", 0),
                    "stage": pipeline_result.get("final_stage", "unknown"),
                })
            else:
                flow_result["steps"].append({
                    "step": "ai_qualification",
                    "status": "skipped",
                    "reason": "No database connection",
                })
        except Exception as e:
            flow_result["steps"].append({
                "step": "ai_qualification",
                "status": "error",
                "error": str(e),
            })

        # Step 2: WhatsApp outreach
        try:
            from app.integrations.whatsapp import send_whatsapp_message
            phone = deal.get("phone", "")
            if phone:
                outreach_message = deal.get(
                    "outreach_message",
                    f"مرحبا، نقدر نساعدكم في {deal.get('company_name', 'شركتكم')} "
                    f"لتسريع الإيرادات عبر Dealix. تبي تعرف كيف؟"
                )
                wa_result = await send_whatsapp_message(phone, outreach_message)
                flow_result["steps"].append({
                    "step": "whatsapp_outreach",
                    "status": "sent",
                    "result": wa_result,
                })
            else:
                flow_result["steps"].append({
                    "step": "whatsapp_outreach",
                    "status": "skipped",
                    "reason": "No phone number",
                })
        except Exception as e:
            flow_result["steps"].append({
                "step": "whatsapp_outreach",
                "status": "error",
                "error": str(e),
            })

        # Step 3: Email outreach
        try:
            email = deal.get("email", "")
            if email:
                from app.integrations.email_sender import send_email
                company = deal.get("company_name", "شركتكم")
                person = deal.get("decision_maker", "")
                subject = f"فرصة نمو لـ {company} — Dealix AI"
                body = f"""
                <div dir="rtl" style="font-family: 'Noto Naskh Arabic', Arial; font-size: 16px;">
                    <p>السلام عليكم {person},</p>
                    <p>أتواصل معكم من <strong>Dealix</strong> — النظام الذكي لإدارة المبيعات في السعودية.</p>
                    <p>نساعد شركات مثل {company} في:</p>
                    <ul>
                        <li>🤖 استجابة آلية 24/7 عبر الواتساب</li>
                        <li>📊 تأهيل ذكي للعملاء المحتملين</li>
                        <li>📅 حجز اجتماعات تلقائي</li>
                        <li>📈 زيادة الإيرادات 30-50%</li>
                    </ul>
                    <p>ممكن نخصص 15 دقيقة لعرض سريع هالأسبوع؟</p>
                    <p>تحياتي,<br>فريق Dealix</p>
                </div>
                """
                email_result = await send_email(email, subject, body)
                flow_result["steps"].append({
                    "step": "email_outreach",
                    "status": "sent",
                    "result": email_result,
                })
            else:
                flow_result["steps"].append({
                    "step": "email_outreach",
                    "status": "skipped",
                    "reason": "No email address",
                })
        except Exception as e:
            flow_result["steps"].append({
                "step": "email_outreach",
                "status": "error",
                "error": str(e),
            })

        # Step 4: LinkedIn connection
        try:
            from app.services.linkedin_service import linkedin_service
            linkedin_result = linkedin_service.send_connection_request(
                company_name=deal.get("company_name", "Unknown"),
                person_name=deal.get("decision_maker", "Sales Director"),
            )
            flow_result["steps"].append({
                "step": "linkedin_connection",
                "status": "sent",
                "result": linkedin_result,
            })
        except Exception as e:
            flow_result["steps"].append({
                "step": "linkedin_connection",
                "status": "error",
                "error": str(e),
            })

        # Summary
        completed = sum(1 for s in flow_result["steps"] if s["status"] in ("completed", "sent"))
        flow_result["status"] = "completed"
        flow_result["summary"] = {
            "total_steps": len(flow_result["steps"]),
            "completed": completed,
            "success_rate": completed / max(len(flow_result["steps"]), 1),
        }

        return flow_result


prospecting_durable_flow = ProspectingDurableFlow()
