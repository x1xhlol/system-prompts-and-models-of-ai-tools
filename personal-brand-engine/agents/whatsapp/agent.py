"""WhatsApp agent -- auto-responds, directs to booking, and acts as personal assistant."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from agents.base_agent import BaseAgent
from agents.whatsapp.responder import generate_response
from storage.models import Contact

logger = logging.getLogger(__name__)

# In-memory conversation history cache keyed by phone number.
# In production, persist this to the database or Redis.
_CONVERSATION_CACHE: dict[str, list[dict[str, str]]] = {}

# Maximum turns to keep per conversation.
_MAX_HISTORY = 20


class WhatsAppAgent(BaseAgent):
    """Autonomous WhatsApp agent for Sami Mohammed Assiri's personal brand.

    Handles incoming WhatsApp messages, generates context-aware responses
    using an LLM, stores contacts, and directs people to Cal.com for booking.
    """

    agent_name: str = "whatsapp"

    def __init__(
        self,
        config: Any,
        llm_client: Any,
        db_session: Session,
    ) -> None:
        super().__init__(config, llm_client, db_session)

    # ------------------------------------------------------------------
    # Task dispatcher
    # ------------------------------------------------------------------

    async def run(self, task: str, **kwargs: Any) -> dict:
        """Dispatch *task* to the appropriate handler.

        Supported tasks:
        - ``handle_message`` -- respond to an incoming WhatsApp message
        """
        dispatch = {
            "handle_message": self._handle_message_task,
        }

        handler = dispatch.get(task)
        if handler is None:
            self.log_action(task, details=f"Unknown task: {task}", status="failed")
            return {"status": "error", "message": f"Unknown task: {task}"}

        with self.timer() as t:
            try:
                result = await handler(**kwargs)
                self.log_action(task, details=str(result), duration=t.elapsed)
                return {"status": "success", "result": result}
            except Exception as exc:
                logger.exception("Task %s failed", task)
                self.log_action(
                    task,
                    details=str(exc),
                    status="failed",
                    duration=t.elapsed,
                )
                await self.notify_owner(
                    f"[WhatsApp Agent] Task '{task}' failed: {exc}"
                )
                return {"status": "error", "message": str(exc)}

    async def _handle_message_task(
        self,
        *,
        from_number: str,
        message_text: str,
        sender_name: str | None = None,
    ) -> dict:
        """Internal dispatcher target for the ``handle_message`` task."""
        response = await self.handle_message(
            from_number=from_number,
            message_text=message_text,
            sender_name=sender_name,
        )
        return {"from_number": from_number, "response": response}

    # ------------------------------------------------------------------
    # Core message handler
    # ------------------------------------------------------------------

    async def handle_message(
        self,
        from_number: str,
        message_text: str,
        sender_name: str | None = None,
    ) -> str:
        """Process an incoming WhatsApp message and return a response string.

        Parameters
        ----------
        from_number:
            The sender's phone number in E.164 format.
        message_text:
            The text body of the incoming message.
        sender_name:
            Optional display name of the sender (from WhatsApp profile).

        Returns
        -------
        str
            The response text to send back.
        """
        display_name = sender_name or from_number

        # Upsert contact in the database
        self._upsert_contact(from_number, sender_name)

        # Retrieve / initialise conversation history
        history = _CONVERSATION_CACHE.setdefault(from_number, [])

        # Append the user message to history
        history.append({"role": "user", "content": message_text})

        # Generate a response via LLM
        brand_profile = self.get_brand_profile()

        try:
            response_text = await generate_response(
                llm_client=self.llm,
                message=message_text,
                sender_name=display_name,
                brand_profile=brand_profile,
                conversation_history=history,
            )
        except Exception as exc:
            logger.error(
                "LLM response generation failed for %s: %s", from_number, exc
            )
            # Graceful fallback in Arabic
            response_text = (
                "شكراً لتواصلك. سامي غير متاح حالياً وسيرد عليك في أقرب وقت.\n"
                "Thank you for reaching out. Sami is currently unavailable "
                "and will get back to you soon."
            )

        # Append assistant response to history
        history.append({"role": "assistant", "content": response_text})

        # Trim history if it exceeds the maximum
        if len(history) > _MAX_HISTORY * 2:
            _CONVERSATION_CACHE[from_number] = history[-_MAX_HISTORY * 2 :]

        logger.info(
            "Responded to %s (%s): %s",
            display_name,
            from_number,
            response_text[:80],
        )
        return response_text

    # ------------------------------------------------------------------
    # Contact management
    # ------------------------------------------------------------------

    def _upsert_contact(
        self, phone: str, name: str | None = None
    ) -> Contact:
        """Create or update a contact record for the given phone number."""
        contact = (
            self.db.query(Contact)
            .filter(Contact.phone == phone, Contact.platform == "whatsapp")
            .first()
        )

        if contact is None:
            contact = Contact(
                name=name or phone,
                phone=phone,
                platform="whatsapp",
                last_contact_at=datetime.now(timezone.utc),
            )
            self.db.add(contact)
            logger.info("New WhatsApp contact created: %s (%s)", name, phone)
        else:
            if name and contact.name == contact.phone:
                contact.name = name
            contact.last_contact_at = datetime.now(timezone.utc)

        try:
            self.db.flush()
        except Exception:
            logger.exception("Failed to upsert contact %s", phone)
            self.db.rollback()

        return contact
