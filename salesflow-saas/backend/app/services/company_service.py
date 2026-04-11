"""
Company Service — B2B company management, enrichment, CR validation.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession


class CompanyService:
    """Manages B2B company profiles and account intelligence."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_company(
        self,
        tenant_id: str,
        name: str,
        name_ar: str = "",
        sector: str = "",
        size: str = "small",
        city: str = "",
        region: str = "",
        cr_number: str = "",
        website: str = "",
    ) -> dict:
        from app.models.company import Company

        company = Company(
            id=uuid.uuid4(),
            tenant_id=uuid.UUID(tenant_id),
            name=name,
            name_ar=name_ar,
            sector=sector,
            size=size,
            city=city,
            region=region,
            cr_number=cr_number,
            website=website,
            is_active=True,
        )
        self.db.add(company)
        await self.db.flush()
        return self._to_dict(company)

    async def get_company(self, tenant_id: str, company_id: str) -> Optional[dict]:
        from app.models.company import Company

        result = await self.db.execute(
            select(Company).where(
                Company.id == uuid.UUID(company_id),
                Company.tenant_id == uuid.UUID(tenant_id),
            )
        )
        c = result.scalar_one_or_none()
        return self._to_dict(c) if c else None

    async def list_companies(
        self,
        tenant_id: str,
        sector: str = None,
        size: str = None,
        city: str = None,
        search: str = None,
        page: int = 1,
        per_page: int = 25,
    ) -> dict:
        from app.models.company import Company

        query = select(Company).where(
            Company.tenant_id == uuid.UUID(tenant_id),
            Company.is_active == True,
        )

        if sector:
            query = query.where(Company.sector == sector)
        if size:
            query = query.where(Company.size == size)
        if city:
            query = query.where(Company.city == city)
        if search:
            pattern = f"%{search}%"
            query = query.where(
                or_(
                    Company.name.ilike(pattern),
                    Company.name_ar.ilike(pattern),
                    Company.cr_number.ilike(pattern),
                )
            )

        count_q = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_q)).scalar() or 0

        query = query.order_by(Company.created_at.desc())
        query = query.offset((page - 1) * per_page).limit(per_page)
        result = await self.db.execute(query)
        companies = [self._to_dict(c) for c in result.scalars().all()]

        return {"items": companies, "total": total, "page": page, "per_page": per_page}

    async def update_company(self, tenant_id: str, company_id: str, **updates) -> Optional[dict]:
        from app.models.company import Company

        result = await self.db.execute(
            select(Company).where(
                Company.id == uuid.UUID(company_id),
                Company.tenant_id == uuid.UUID(tenant_id),
            )
        )
        company = result.scalar_one_or_none()
        if not company:
            return None

        for key, value in updates.items():
            if hasattr(company, key) and value is not None:
                setattr(company, key, value)

        company.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return self._to_dict(company)

    async def get_company_contacts(self, tenant_id: str, company_id: str) -> list:
        from app.models.company import Contact

        result = await self.db.execute(
            select(Contact).where(
                Contact.company_id == uuid.UUID(company_id),
                Contact.tenant_id == uuid.UUID(tenant_id),
            )
        )
        return [
            {
                "id": str(c.id),
                "full_name": c.full_name,
                "job_title": c.job_title,
                "email": c.email,
                "phone": c.phone,
            }
            for c in result.scalars().all()
        ]

    async def get_company_deals(self, tenant_id: str, company_id: str) -> list:
        from app.models.deal import Deal
        from app.models.lead import Lead

        result = await self.db.execute(
            select(Deal)
            .join(Lead, Deal.lead_id == Lead.id)
            .where(
                Deal.tenant_id == uuid.UUID(tenant_id),
                Lead.company_name != "",
            )
        )
        return [
            {
                "id": str(d.id),
                "title": d.title,
                "stage": d.stage,
                "value": float(d.value) if d.value else 0,
            }
            for d in result.scalars().all()
        ]

    async def get_sector_breakdown(self, tenant_id: str) -> dict:
        from app.models.company import Company

        q = (
            select(Company.sector, func.count().label("count"))
            .where(
                Company.tenant_id == uuid.UUID(tenant_id),
                Company.is_active == True,
                Company.sector != "",
            )
            .group_by(Company.sector)
            .order_by(func.count().desc())
        )
        rows = (await self.db.execute(q)).all()
        return {row.sector: row.count for row in rows}

    @staticmethod
    def _to_dict(company) -> dict:
        if not company:
            return {}
        return {
            "id": str(company.id),
            "tenant_id": str(company.tenant_id),
            "name": company.name,
            "name_ar": company.name_ar,
            "sector": company.sector,
            "size": company.size,
            "city": company.city,
            "region": company.region,
            "cr_number": company.cr_number,
            "website": company.website,
            "is_active": company.is_active,
            "created_at": company.created_at.isoformat() if company.created_at else None,
        }
