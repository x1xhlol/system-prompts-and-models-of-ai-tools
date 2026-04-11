"""
Dealix Saudi Territory Manager
إدارة المناطق وتوزيع العملاء على مندوبي المبيعات تلقائياً
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import Lead
from app.models.user import User
from app.models.deal import Deal

logger = logging.getLogger("dealix.territory")

SAUDI_REGIONS: dict[str, dict] = {
    "riyadh": {
        "name_ar": "الرياض",
        "name_en": "Riyadh",
        "cities_ar": ["الرياض", "الخرج", "الدرعية", "المجمعة"],
    },
    "jeddah": {
        "name_ar": "جدة",
        "name_en": "Jeddah",
        "cities_ar": ["جدة", "رابغ", "الليث"],
    },
    "eastern": {
        "name_ar": "المنطقة الشرقية",
        "name_en": "Eastern Province",
        "cities_ar": ["الدمام", "الخبر", "الظهران", "الجبيل", "الأحساء", "القطيف"],
    },
    "makkah": {
        "name_ar": "مكة المكرمة",
        "name_en": "Makkah",
        "cities_ar": ["مكة المكرمة", "الطائف"],
    },
    "madinah": {
        "name_ar": "المدينة المنورة",
        "name_en": "Madinah",
        "cities_ar": ["المدينة المنورة", "ينبع"],
    },
    "asir": {
        "name_ar": "عسير",
        "name_en": "Asir",
        "cities_ar": ["أبها", "خميس مشيط", "النماص"],
    },
    "qassim": {
        "name_ar": "القصيم",
        "name_en": "Qassim",
        "cities_ar": ["بريدة", "عنيزة", "الرس"],
    },
    "tabuk": {
        "name_ar": "تبوك",
        "name_en": "Tabuk",
        "cities_ar": ["تبوك", "ضبا", "الوجه"],
    },
    "hail": {
        "name_ar": "حائل",
        "name_en": "Hail",
        "cities_ar": ["حائل", "بقعاء"],
    },
    "jazan": {
        "name_ar": "جازان",
        "name_en": "Jazan",
        "cities_ar": ["جازان", "صبيا", "أبو عريش"],
    },
    "najran": {
        "name_ar": "نجران",
        "name_en": "Najran",
        "cities_ar": ["نجران", "شرورة"],
    },
    "baha": {
        "name_ar": "الباحة",
        "name_en": "Al Baha",
        "cities_ar": ["الباحة", "بلجرشي"],
    },
    "jouf": {
        "name_ar": "الجوف",
        "name_en": "Al Jouf",
        "cities_ar": ["سكاكا", "دومة الجندل"],
    },
}


class TerritoryAssignment(BaseModel):
    territory_key: str
    rep_ids: list[str] = Field(default_factory=list)
    round_robin_index: int = 0


class TerritoryStats(BaseModel):
    territory_key: str
    name_ar: str
    name_en: str
    total_leads: int = 0
    total_deals: int = 0
    total_value: float = 0.0
    win_rate: float = 0.0
    reps_count: int = 0


class TerritoryManager:
    """Territory-based lead routing and performance analytics for Saudi regions."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self._assignments: dict[str, TerritoryAssignment] = {}

    async def assign_territory(
        self, territory_key: str, rep_ids: list[str],
    ) -> dict:
        """Assign sales reps to a territory."""
        if territory_key not in SAUDI_REGIONS:
            raise ValueError(f"منطقة غير معروفة: {territory_key}")

        self._assignments[territory_key] = TerritoryAssignment(
            territory_key=territory_key,
            rep_ids=rep_ids,
            round_robin_index=0,
        )
        region = SAUDI_REGIONS[territory_key]
        logger.info(
            "Territory '%s' assigned to %d reps", territory_key, len(rep_ids),
        )
        return {
            "territory": territory_key,
            "name_ar": region["name_ar"],
            "name_en": region["name_en"],
            "reps_assigned": len(rep_ids),
            "rep_ids": rep_ids,
        }

    async def auto_route_lead(
        self,
        tenant_id: str,
        lead_id: str,
        region_key: Optional[str] = None,
        city_hint: Optional[str] = None,
    ) -> dict:
        """Auto-assign a lead to the next rep in the matching territory via round-robin."""
        territory_key = region_key
        if not territory_key and city_hint:
            territory_key = self._detect_territory(city_hint)
        if not territory_key:
            territory_key = "riyadh"

        assignment = self._assignments.get(territory_key)
        if not assignment or not assignment.rep_ids:
            logger.warning(
                "No reps assigned to territory '%s', falling back to riyadh",
                territory_key,
            )
            assignment = self._assignments.get("riyadh")
            territory_key = "riyadh"

        if not assignment or not assignment.rep_ids:
            return {
                "lead_id": lead_id,
                "assigned_to": None,
                "territory": territory_key,
                "error_ar": "لا يوجد مندوبين معينين لهذه المنطقة",
            }

        rep_id = assignment.rep_ids[assignment.round_robin_index % len(assignment.rep_ids)]
        assignment.round_robin_index += 1

        import uuid
        result = await self.db.execute(
            select(Lead).where(
                Lead.id == uuid.UUID(lead_id),
                Lead.tenant_id == uuid.UUID(tenant_id),
            )
        )
        lead = result.scalar_one_or_none()
        if lead:
            lead.assigned_to = uuid.UUID(rep_id)
            metadata = dict(lead.extra_metadata or {})
            metadata["territory"] = territory_key
            metadata["auto_routed_at"] = datetime.now(timezone.utc).isoformat()
            lead.extra_metadata = metadata
            await self.db.flush()

        region = SAUDI_REGIONS.get(territory_key, {})
        logger.info("Lead %s routed to rep %s in %s", lead_id, rep_id, territory_key)
        return {
            "lead_id": lead_id,
            "assigned_to": rep_id,
            "territory": territory_key,
            "territory_name_ar": region.get("name_ar", ""),
        }

    async def get_territory_stats(
        self, tenant_id: str, territory_key: Optional[str] = None,
    ) -> list[TerritoryStats]:
        """Get performance analytics per territory."""
        import uuid

        keys = [territory_key] if territory_key else list(SAUDI_REGIONS.keys())
        stats_list: list[TerritoryStats] = []

        for key in keys:
            region = SAUDI_REGIONS.get(key)
            if not region:
                continue

            assignment = self._assignments.get(key)
            rep_ids = assignment.rep_ids if assignment else []

            if not rep_ids:
                stats_list.append(TerritoryStats(
                    territory_key=key,
                    name_ar=region["name_ar"],
                    name_en=region["name_en"],
                ))
                continue

            rep_uuids = [uuid.UUID(r) for r in rep_ids]
            tid = uuid.UUID(tenant_id)

            lead_count_q = select(func.count()).where(
                Lead.tenant_id == tid,
                Lead.assigned_to.in_(rep_uuids),
            )
            total_leads = (await self.db.execute(lead_count_q)).scalar() or 0

            deals_q = select(func.count(), func.coalesce(func.sum(Deal.value), 0)).where(
                Deal.tenant_id == tid,
                Deal.assigned_to.in_(rep_uuids),
            )
            row = (await self.db.execute(deals_q)).one_or_none()
            total_deals = row[0] if row else 0
            total_value = float(row[1]) if row else 0.0

            won_q = select(func.count()).where(
                Deal.tenant_id == tid,
                Deal.assigned_to.in_(rep_uuids),
                Deal.stage == "closed_won",
            )
            won_count = (await self.db.execute(won_q)).scalar() or 0
            win_rate = round((won_count / total_deals) * 100, 1) if total_deals > 0 else 0.0

            stats_list.append(TerritoryStats(
                territory_key=key,
                name_ar=region["name_ar"],
                name_en=region["name_en"],
                total_leads=total_leads,
                total_deals=total_deals,
                total_value=total_value,
                win_rate=win_rate,
                reps_count=len(rep_ids),
            ))

        return stats_list

    def list_regions(self) -> list[dict]:
        """Return all Saudi regions with metadata."""
        return [
            {
                "key": key,
                "name_ar": info["name_ar"],
                "name_en": info["name_en"],
                "cities_ar": info["cities_ar"],
                "reps_assigned": len(self._assignments.get(key, TerritoryAssignment(territory_key=key)).rep_ids),
            }
            for key, info in SAUDI_REGIONS.items()
        ]

    def _detect_territory(self, city_hint: str) -> Optional[str]:
        """Detect territory from a city name hint (Arabic or English)."""
        hint_lower = city_hint.strip().lower()
        for key, info in SAUDI_REGIONS.items():
            if hint_lower in info["name_en"].lower() or hint_lower == key:
                return key
            for city in info["cities_ar"]:
                if city in city_hint:
                    return key
        return None
