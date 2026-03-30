"""LLM-powered email classifier for Sami Assiri's inbox."""

from __future__ import annotations

from utils.logger import get_logger

logger = get_logger(__name__)

_VALID_CLASSIFICATIONS = {"urgent", "reply_needed", "spam", "info"}

_SYSTEM_PROMPT = """\
You are an email classification assistant for Sami Assiri, a Field Services Engineer \
at METCO stationed at King Khalid International Airport, Riyadh. Sami is also a \
Mechanical Engineer with experience in Python/data analytics and leadership roles \
(SPE Alasala Chapter President, Elite Engineers Club Founder).

Classify the incoming email into exactly ONE of these categories:

- urgent: Job offers, interview invitations, meeting requests from colleagues or \
managers, professional inquiries about engineering services, messages from Aramco / \
METCO / Samsung E&A, messages from SPE or university contacts requiring action, \
security-related operational emails, time-sensitive requests.

- reply_needed: Professional networking messages, follow-up questions, LinkedIn \
connection requests forwarded by email, general collaboration proposals, non-urgent \
questions, event invitations with upcoming deadlines.

- info: Newsletters, promotional offers, subscription updates, platform notifications \
(LinkedIn, GitHub, etc.), informational digests, automated reports, order confirmations, \
shipping updates.

- spam: Unsolicited commercial messages, phishing attempts, scam emails, irrelevant \
mass marketing, suspicious links, fake prize notifications.

Respond with ONLY the classification label (one word, lowercase). Nothing else.\
"""


async def classify_email(
    llm_client,
    subject: str,
    body: str,
    from_addr: str,
) -> str:
    """Classify an email using the LLM.

    Parameters
    ----------
    llm_client:
        An :class:`LLMClient` instance.
    subject:
        The email subject line.
    body:
        The email body text (may be truncated).
    from_addr:
        The sender's email address / display name.

    Returns
    -------
    str
        One of ``urgent``, ``reply_needed``, ``spam``, or ``info``.
    """
    prompt = (
        f"From: {from_addr}\n"
        f"Subject: {subject}\n\n"
        f"Body:\n{body[:2000]}\n\n"
        "Classification:"
    )

    try:
        response = await llm_client.generate(
            prompt=prompt,
            system_prompt=_SYSTEM_PROMPT,
            temperature=0.1,
            max_tokens=10,
        )
        classification = response.text.strip().lower().rstrip(".")

        if classification not in _VALID_CLASSIFICATIONS:
            # Attempt partial match (e.g. "urgent - this is..." -> "urgent")
            for label in _VALID_CLASSIFICATIONS:
                if label in classification:
                    classification = label
                    break
            else:
                logger.warning(
                    "email_classification_fallback",
                    raw=response.text,
                    message="LLM returned unrecognised label, defaulting to info",
                )
                classification = "info"

        logger.info(
            "email_classified",
            subject=subject[:80],
            classification=classification,
        )
        return classification

    except Exception as exc:
        logger.error(
            "email_classification_error",
            error=str(exc),
            subject=subject[:80],
        )
        # Fail-safe: treat as reply_needed so nothing important is missed
        return "reply_needed"
