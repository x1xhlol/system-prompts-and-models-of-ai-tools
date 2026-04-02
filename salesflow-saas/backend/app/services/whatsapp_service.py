"""
Dealix WhatsApp Intelligence Service
=====================================
الواتساب هو القلب — كل lead يدخل من هنا
"""
import asyncio
import json
import os
import httpx
import logging
from datetime import datetime
from typing import Optional

from groq import AsyncGroq

logger = logging.getLogger(__name__)

WHATSAPP_API_URL = "https://graph.facebook.com/v21.0"
MOCK_MODE = os.getenv("WHATSAPP_MOCK_MODE", "true").lower() == "true"


class WhatsAppService:
    """Complete WhatsApp Business API integration."""

    def __init__(self):
        self.token = os.getenv("WHATSAPP_API_TOKEN", "")
        self.phone_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
        self.mock = MOCK_MODE
        self.groq = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", ""))
        self.conversation_store: dict = {}

    async def send_message(self, to: str, message: str) -> dict:
        """Send WhatsApp message (real or mock)."""
        if self.mock:
            logger.info(f"📱 [MOCK] WhatsApp → {to}: {message[:50]}...")
            return {"status": "sent_mock", "to": to, "timestamp": datetime.utcnow().isoformat()}

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{WHATSAPP_API_URL}/{self.phone_id}/messages",
                headers={"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"},
                json={
                    "messaging_product": "whatsapp",
                    "to": to,
                    "type": "text",
                    "text": {"body": message}
                }
            )
            return response.json()

    async def send_template(self, to: str, template_name: str, params: list) -> dict:
        """Send WhatsApp template message."""
        if self.mock:
            return {"status": "template_sent_mock", "template": template_name}

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{WHATSAPP_API_URL}/{self.phone_id}/messages",
                headers={"Authorization": f"Bearer {self.token}"},
                json={
                    "messaging_product": "whatsapp",
                    "to": to,
                    "type": "template",
                    "template": {
                        "name": template_name,
                        "language": {"code": "ar"},
                        "components": [{"type": "body", "parameters": [
                            {"type": "text", "text": p} for p in params
                        ]}]
                    }
                }
            )
            return response.json()

    async def handle_incoming_message(self, webhook_data: dict) -> dict:
        """Process incoming WhatsApp message and generate intelligent reply."""
        try:
            entry = webhook_data.get("entry", [{}])[0]
            changes = entry.get("changes", [{}])[0]
            value = changes.get("value", {})
            messages = value.get("messages", [])

            if not messages:
                return {"status": "no_messages"}

            msg = messages[0]
            sender = msg.get("from", "")
            text = msg.get("text", {}).get("body", "")
            msg_id = msg.get("id", "")

            logger.info(f"📨 Incoming from {sender}: {text}")

            # Store in conversation history
            if sender not in self.conversation_store:
                self.conversation_store[sender] = []
            self.conversation_store[sender].append({"role": "user", "content": text})

            # Generate intelligent reply
            reply = await self._generate_intelligent_reply(sender, text)

            # Send reply
            await self.send_message(sender, reply)

            # Store reply
            self.conversation_store[sender].append({"role": "assistant", "content": reply})

            return {
                "status": "replied",
                "sender": sender,
                "incoming": text,
                "reply": reply,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"WhatsApp handler error: {e}")
            return {"status": "error", "error": str(e)}

    async def _generate_intelligent_reply(self, sender: str, message: str) -> str:
        """Generate context-aware Arabic WhatsApp reply."""
        history = self.conversation_store.get(sender, [])[-6:]  # Last 3 exchanges

        system = """أنت مساعد ذكي لديليكس (نظام ذكاء اصطناعي للمبيعات) في السوق السعودي.

قواعدك:
1. رد باللهجة السعودية الخليجية الراقية
2. كن مختصراً ومفيداً (3-4 أسطر كحد أقصى)
3. إذا سأل عن خدمة → وضح الفائدة واعرض موعد للعرض
4. إذا اعترض → أجبه بذكاء وأعد التأطير
5. الهدف دائماً: حجز اجتماع
6. لا تكن مبيعاتياً بشكل واضح في البداية"""

        messages = [{"role": "system", "content": system}]
        messages.extend(history)
        messages.append({"role": "user", "content": message})

        response = await self.groq.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.6,
            max_tokens=200
        )
        return response.choices[0].message.content.strip()

    async def run_outreach_campaign(self, leads: list, message_template: str) -> dict:
        """Run bulk WhatsApp outreach campaign."""
        results = {"sent": 0, "failed": 0, "details": []}

        for lead in leads:
            try:
                phone = lead.get("phone", "")
                name = lead.get("name", "")
                company = lead.get("company", "")

                # Personalize message
                personalized = message_template.replace("{name}", name).replace("{company}", company)

                result = await self.send_message(phone, personalized)
                results["sent"] += 1
                results["details"].append({"phone": phone, "status": "sent"})

                # Rate limit: 80 msgs/second max (WhatsApp limit)
                await asyncio.sleep(0.1)

            except Exception as e:
                results["failed"] += 1
                results["details"].append({"phone": lead.get("phone"), "error": str(e)})

        return results
