"""
Graded policy evaluation: auto_execute | approval_required | blocked.
محرك سياسات متدرج مرتبط بوضع التشغيل والقطاع والقناة والقيمة.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.strategic_deals.operating_modes import ModeEnforcer, OperatingMode, MODE_POLICIES
from app.services.dealix_os.vertical_playbooks import VERTICAL_PLAYBOOKS

REGULATED_SECTORS = frozenset(
    {"healthcare", "pharma", "medical", "finance", "banking", "insurance", "real_estate"}
)


def _normalize_industry(industry: str | None) -> str:
    if not industry:
        return ""
    return industry.strip().lower().replace(" ", "_")


async def evaluate_action(
    *,
    tenant_id,
    channel: str,
    action: str,
    deal_value_sar: float,
    industry: str | None,
    db: AsyncSession,
) -> dict:
    mode = await ModeEnforcer.get_current_mode(str(tenant_id), db)
    policy = MODE_POLICIES.get(mode)
    if not policy:
        return {
            "level": "blocked",
            "reason_ar": "وضع تشغيل غير معرّف",
            "mode": mode.value,
            "mode_name": mode.name,
        }

    ind = _normalize_industry(industry)
    is_regulated = any(s in ind for s in REGULATED_SECTORS) or ind in REGULATED_SECTORS

    channel_ok, ch_msg = await ModeEnforcer.check_channel(mode, channel)
    if not channel_ok:
        return {
            "level": "blocked",
            "reason_ar": ch_msg,
            "mode": mode.value,
            "mode_name": mode.name,
            "channel": channel,
            "action": action,
        }

    action_ok, act_msg = await ModeEnforcer.check_action(mode, action, deal_value_sar, db)
    if not action_ok:
        return {
            "level": "approval_required",
            "reason_ar": act_msg,
            "mode": mode.value,
            "mode_name": mode.name,
            "channel": channel,
            "action": action,
        }

    # Extra gates: regulated + high-touch channels
    if is_regulated and channel == "whatsapp" and policy.auto_send:
        return {
            "level": "approval_required",
            "reason_ar": "قطاع حساس: يُفضّل موافقة بشرية قبل إرسال واتساب.",
            "mode": mode.value,
            "mode_name": mode.name,
            "channel": channel,
            "action": action,
        }

    if action in {"send_custom_message", "run_outreach_campaign"} and deal_value_sar > policy.max_auto_commitment_sar > 0:
        return {
            "level": "approval_required",
            "reason_ar": "قيمة الصفقة تتجاوز حد الالتزام التلقائي لوضع التشغيل الحالي.",
            "mode": mode.value,
            "mode_name": mode.name,
            "channel": channel,
            "action": action,
        }

    return {
        "level": "auto_execute",
        "reason_ar": "مسموح ضمن السياسات الحالية.",
        "mode": mode.value,
        "mode_name": mode.name,
        "channel": channel,
        "action": action,
    }


def suggested_playbook_for_industry(industry: str | None) -> str | None:
    """Pick a default vertical playbook id from coarse industry string."""
    ind = _normalize_industry(industry)
    if not ind:
        return None
    if any(x in ind for x in ("عقار", "real", "estate", "property")):
        return "real_estate"
    if any(x in ind for x in ("صح", "health", "medical", "clinic", "hospital")):
        return "healthcare"
    if any(x in ind for x in ("saas", "software", "tech", "برمج")):
        return "saas_b2b"
    if any(x in ind for x in ("consult", "legal", "محاسب", "service")):
        return "professional_services"
    return None
