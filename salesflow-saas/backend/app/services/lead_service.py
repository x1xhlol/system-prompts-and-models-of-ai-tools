"""
Lead Service — CRUD, qualification, scoring, assignment, import/export.
The heart of the sales pipeline.
"""

import csv
import io
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, func, and_, or_, update
from sqlalchemy.ext.asyncio import AsyncSession


class LeadService:
    """Manages the full lifecycle of leads from creation to conversion."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── CRUD ──────────────────────────────────────

    async def create_lead(
        self,
        tenant_id: str,
        full_name: str,
        phone: str = "",
        email: str = "",
        company_name: str = "",
        sector: str = "",
        city: str = "",
        source: str = "web",
        notes: str = "",
        assigned_to: str = None,
    ) -> dict:
        from app.models.lead import Lead

        lead = Lead(
            id=uuid.uuid4(),
            tenant_id=uuid.UUID(tenant_id),
            full_name=full_name,
            phone=phone,
            email=email,
            company_name=company_name,
            sector=sector,
            city=city,
            source=source,
            status="new",
            score=0,
            notes=notes,
            assigned_to=uuid.UUID(assigned_to) if assigned_to else None,
        )
        self.db.add(lead)
        await self.db.flush()
        return self._to_dict(lead)

    async def get_lead(self, tenant_id: str, lead_id: str) -> Optional[dict]:
        from app.models.lead import Lead

        result = await self.db.execute(
            select(Lead).where(
                Lead.id == uuid.UUID(lead_id),
                Lead.tenant_id == uuid.UUID(tenant_id),
            )
        )
        lead = result.scalar_one_or_none()
        return self._to_dict(lead) if lead else None

    async def list_leads(
        self,
        tenant_id: str,
        status: str = None,
        source: str = None,
        sector: str = None,
        city: str = None,
        assigned_to: str = None,
        min_score: int = None,
        search: str = None,
        page: int = 1,
        per_page: int = 25,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> dict:
        from app.models.lead import Lead

        query = select(Lead).where(Lead.tenant_id == uuid.UUID(tenant_id))

        if status:
            query = query.where(Lead.status == status)
        if source:
            query = query.where(Lead.source == source)
        if sector:
            query = query.where(Lead.sector == sector)
        if city:
            query = query.where(Lead.city == city)
        if assigned_to:
            query = query.where(Lead.assigned_to == uuid.UUID(assigned_to))
        if min_score is not None:
            query = query.where(Lead.score >= min_score)
        if search:
            pattern = f"%{search}%"
            query = query.where(
                or_(
                    Lead.full_name.ilike(pattern),
                    Lead.email.ilike(pattern),
                    Lead.phone.ilike(pattern),
                    Lead.company_name.ilike(pattern),
                )
            )

        # Count
        count_q = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_q)).scalar() or 0

        # Sort
        sort_col = getattr(Lead, sort_by, Lead.created_at)
        if sort_dir == "asc":
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())

        # Paginate
        query = query.offset((page - 1) * per_page).limit(per_page)
        result = await self.db.execute(query)
        leads = [self._to_dict(l) for l in result.scalars().all()]

        return {
            "items": leads,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
        }

    async def update_lead(
        self, tenant_id: str, lead_id: str, **updates
    ) -> Optional[dict]:
        from app.models.lead import Lead

        result = await self.db.execute(
            select(Lead).where(
                Lead.id == uuid.UUID(lead_id),
                Lead.tenant_id == uuid.UUID(tenant_id),
            )
        )
        lead = result.scalar_one_or_none()
        if not lead:
            return None

        for key, value in updates.items():
            if hasattr(lead, key) and value is not None:
                setattr(lead, key, value)

        lead.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return self._to_dict(lead)

    async def delete_lead(self, tenant_id: str, lead_id: str) -> bool:
        from app.models.lead import Lead

        result = await self.db.execute(
            select(Lead).where(
                Lead.id == uuid.UUID(lead_id),
                Lead.tenant_id == uuid.UUID(tenant_id),
            )
        )
        lead = result.scalar_one_or_none()
        if not lead:
            return False

        lead.status = "deleted"
        lead.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return True

    # ── Assignment ────────────────────────────────

    async def assign_lead(
        self,
        tenant_id: str,
        lead_id: str,
        agent_id: str,
    ) -> Optional[dict]:
        return await self.update_lead(
            tenant_id, lead_id, assigned_to=uuid.UUID(agent_id)
        )

    async def auto_assign_round_robin(self, tenant_id: str, lead_id: str) -> Optional[dict]:
        """Assign lead to the agent with the fewest active leads."""
        from app.models.user import User
        from app.models.lead import Lead

        # Get active agents
        agents_q = select(User.id).where(
            User.tenant_id == uuid.UUID(tenant_id),
            User.role.in_(["agent", "manager"]),
            User.is_active == True,
        )
        agents = (await self.db.execute(agents_q)).scalars().all()
        if not agents:
            return None

        # Count active leads per agent
        best_agent = None
        min_leads = float("inf")
        for agent_id in agents:
            count_q = select(func.count()).where(
                Lead.tenant_id == uuid.UUID(tenant_id),
                Lead.assigned_to == agent_id,
                Lead.status.in_(["new", "contacted", "qualified"]),
            )
            count = (await self.db.execute(count_q)).scalar() or 0
            if count < min_leads:
                min_leads = count
                best_agent = agent_id

        if best_agent:
            return await self.assign_lead(tenant_id, lead_id, str(best_agent))
        return None

    # ── Qualification ─────────────────────────────

    async def qualify_lead(
        self,
        tenant_id: str,
        lead_id: str,
        score: int,
        status: str = None,
        reasoning: str = "",
    ) -> Optional[dict]:
        updates = {"score": score}
        if status:
            updates["status"] = status
        if score >= 70:
            updates["status"] = "qualified"
            updates["qualified_at"] = datetime.now(timezone.utc)
        elif score < 30:
            updates["status"] = "lost"
        else:
            updates["status"] = "contacted"

        return await self.update_lead(tenant_id, lead_id, **updates)

    # ── Conversion ────────────────────────────────

    async def convert_to_deal(
        self,
        tenant_id: str,
        lead_id: str,
        deal_title: str = "",
        deal_value: float = 0,
    ) -> Optional[dict]:
        from app.models.deal import Deal

        lead = await self.get_lead(tenant_id, lead_id)
        if not lead:
            return None

        deal = Deal(
            id=uuid.uuid4(),
            tenant_id=uuid.UUID(tenant_id),
            lead_id=uuid.UUID(lead_id),
            assigned_to=uuid.UUID(lead["assigned_to"]) if lead.get("assigned_to") else None,
            title=deal_title or f"Deal - {lead['full_name']}",
            stage="discovery",
            value=deal_value,
            currency="SAR",
            probability=20,
        )
        self.db.add(deal)

        await self.update_lead(
            tenant_id,
            lead_id,
            status="converted",
            converted_at=datetime.now(timezone.utc),
        )
        await self.db.flush()

        return {
            "deal_id": str(deal.id),
            "lead_id": lead_id,
            "title": deal.title,
            "stage": deal.stage,
            "value": float(deal.value),
        }

    # ── Import/Export ─────────────────────────────

    async def import_from_csv(self, tenant_id: str, csv_content: str) -> dict:
        reader = csv.DictReader(io.StringIO(csv_content))
        created = 0
        errors = []

        for i, row in enumerate(reader, 1):
            try:
                await self.create_lead(
                    tenant_id=tenant_id,
                    full_name=row.get("name", row.get("full_name", "")),
                    phone=row.get("phone", ""),
                    email=row.get("email", ""),
                    company_name=row.get("company", row.get("company_name", "")),
                    sector=row.get("sector", row.get("industry", "")),
                    city=row.get("city", ""),
                    source="import",
                )
                created += 1
            except Exception as e:
                errors.append({"row": i, "error": str(e)})

        return {"created": created, "errors": errors, "total_rows": created + len(errors)}

    async def export_to_csv(self, tenant_id: str, **filters) -> str:
        data = await self.list_leads(tenant_id, per_page=10000, **filters)
        output = io.StringIO()
        if not data["items"]:
            return ""

        writer = csv.DictWriter(output, fieldnames=data["items"][0].keys())
        writer.writeheader()
        writer.writerows(data["items"])
        return output.getvalue()

    # ── Stats ─────────────────────────────────────

    async def get_stats(self, tenant_id: str) -> dict:
        from app.models.lead import Lead

        base = select(func.count()).where(Lead.tenant_id == uuid.UUID(tenant_id))
        total = (await self.db.execute(base)).scalar() or 0

        statuses = {}
        for s in ["new", "contacted", "qualified", "converted", "lost"]:
            q = base.where(Lead.status == s)
            statuses[s] = (await self.db.execute(q)).scalar() or 0

        avg_score_q = select(func.avg(Lead.score)).where(
            Lead.tenant_id == uuid.UUID(tenant_id),
            Lead.score > 0,
        )
        avg_score = (await self.db.execute(avg_score_q)).scalar() or 0

        return {
            "total": total,
            "by_status": statuses,
            "avg_score": round(float(avg_score), 1),
            "conversion_rate": round(
                (statuses.get("converted", 0) / total * 100) if total > 0 else 0, 1
            ),
        }

    # ── Helpers ───────────────────────────────────

    @staticmethod
    def _to_dict(lead) -> dict:
        if not lead:
            return {}
        return {
            "id": str(lead.id),
            "tenant_id": str(lead.tenant_id),
            "assigned_to": str(lead.assigned_to) if lead.assigned_to else None,
            "source": lead.source,
            "status": lead.status,
            "score": lead.score,
            "full_name": lead.full_name,
            "phone": lead.phone,
            "email": lead.email,
            "company_name": lead.company_name,
            "sector": lead.sector,
            "city": lead.city,
            "notes": lead.notes,
            "qualified_at": lead.qualified_at.isoformat() if lead.qualified_at else None,
            "converted_at": lead.converted_at.isoformat() if lead.converted_at else None,
            "created_at": lead.created_at.isoformat() if lead.created_at else None,
            "updated_at": lead.updated_at.isoformat() if lead.updated_at else None,
        }
