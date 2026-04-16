"""Saudi Compliance Matrix — live controls for PDPL, ZATCA, SDAIA, NCA."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.compliance_control import (
    ComplianceCategory,
    ComplianceControl,
    ComplianceStatus,
    RiskLevel,
)

# Default controls seeded on first scan
DEFAULT_CONTROLS = [
    {"control_id": "PDPL-C01", "control_name": "Consent before outbound messaging", "control_name_ar": "الموافقة قبل الرسائل الصادرة", "category": "pdpl", "risk_level": "critical", "evidence_source": "pdpl.consent_manager"},
    {"control_id": "PDPL-C02", "control_name": "Consent purpose and channel tracking", "control_name_ar": "تتبع غرض وقناة الموافقة", "category": "pdpl", "risk_level": "high", "evidence_source": "models.consent"},
    {"control_id": "PDPL-C03", "control_name": "Auto-expire consent (12 months)", "control_name_ar": "انتهاء الموافقة التلقائي", "category": "pdpl", "risk_level": "high", "evidence_source": "pdpl.consent_manager"},
    {"control_id": "PDPL-C04", "control_name": "Data subject access rights", "control_name_ar": "حق الوصول للبيانات", "category": "pdpl", "risk_level": "high", "evidence_source": "pdpl.data_rights"},
    {"control_id": "PDPL-C05", "control_name": "Data subject deletion rights", "control_name_ar": "حق حذف البيانات", "category": "pdpl", "risk_level": "high", "evidence_source": "pdpl.data_rights"},
    {"control_id": "PDPL-C10", "control_name": "Consent audit trail (immutable)", "control_name_ar": "سجل تدقيق الموافقة", "category": "pdpl", "risk_level": "critical", "evidence_source": "models.consent_audit"},
    {"control_id": "PDPL-C13", "control_name": "Encryption in transit (TLS 1.3)", "control_name_ar": "التشفير أثناء النقل", "category": "pdpl", "risk_level": "critical", "evidence_source": "infrastructure"},
    {"control_id": "ZATCA-C01", "control_name": "VAT calculation (15%)", "control_name_ar": "احتساب ضريبة القيمة المضافة", "category": "zatca", "risk_level": "critical", "evidence_source": "zatca_compliance"},
    {"control_id": "ZATCA-C02", "control_name": "E-invoice format compliance", "control_name_ar": "توافق صيغة الفاتورة الإلكترونية", "category": "zatca", "risk_level": "high", "evidence_source": "zatca_compliance"},
    {"control_id": "SDAIA-C01", "control_name": "AI decision explainability", "control_name_ar": "قابلية تفسير قرارات الذكاء الاصطناعي", "category": "sdaia", "risk_level": "high", "evidence_source": "ai_conversations"},
    {"control_id": "SDAIA-C02", "control_name": "Human-in-the-loop for high-risk decisions", "control_name_ar": "إشراك البشر في القرارات عالية المخاطر", "category": "sdaia", "risk_level": "critical", "evidence_source": "openclaw.policy"},
    {"control_id": "NCA-C01", "control_name": "Access control (RBAC)", "control_name_ar": "التحكم في الوصول", "category": "nca", "risk_level": "critical", "evidence_source": "auth_middleware"},
    {"control_id": "NCA-C02", "control_name": "Multi-tenant isolation", "control_name_ar": "عزل المستأجرين", "category": "nca", "risk_level": "critical", "evidence_source": "models.base.TenantModel"},
    {"control_id": "NCA-C04", "control_name": "Audit logging", "control_name_ar": "سجل التدقيق", "category": "nca", "risk_level": "high", "evidence_source": "audit_service"},
]


class SaudiComplianceMatrix:
    """Manages live compliance controls for Saudi/GCC regulations."""

    async def seed_controls(
        self, db: AsyncSession, *, tenant_id: str
    ) -> int:
        """Seed default controls if none exist for tenant."""
        stmt = select(ComplianceControl).where(ComplianceControl.tenant_id == tenant_id).limit(1)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            return 0

        count = 0
        for ctrl in DEFAULT_CONTROLS:
            control = ComplianceControl(
                tenant_id=tenant_id,
                control_id=ctrl["control_id"],
                control_name=ctrl["control_name"],
                control_name_ar=ctrl["control_name_ar"],
                category=ComplianceCategory(ctrl["category"]),
                risk_level=RiskLevel(ctrl["risk_level"]),
                evidence_source=ctrl["evidence_source"],
                status=ComplianceStatus.PARTIAL,
            )
            db.add(control)
            count += 1

        await db.commit()
        return count

    async def get_matrix(
        self, db: AsyncSession, *, tenant_id: str
    ) -> List[Dict[str, Any]]:
        await self.seed_controls(db, tenant_id=tenant_id)
        stmt = (
            select(ComplianceControl)
            .where(ComplianceControl.tenant_id == tenant_id)
            .order_by(ComplianceControl.control_id)
        )
        result = await db.execute(stmt)
        controls = result.scalars().all()
        return [
            {
                "control_id": c.control_id,
                "control_name": c.control_name,
                "control_name_ar": c.control_name_ar,
                "category": c.category.value if c.category else None,
                "status": c.status.value if c.status else None,
                "risk_level": c.risk_level.value if c.risk_level else None,
                "evidence_source": c.evidence_source,
                "last_checked_at": c.last_checked_at.isoformat() if c.last_checked_at else None,
                "owner": c.owner,
            }
            for c in controls
        ]

    async def get_posture(
        self, db: AsyncSession, *, tenant_id: str
    ) -> Dict[str, Any]:
        matrix = await self.get_matrix(db, tenant_id=tenant_id)
        total = len(matrix)
        compliant = sum(1 for c in matrix if c["status"] == "compliant")
        non_compliant = sum(1 for c in matrix if c["status"] == "non_compliant")
        partial = sum(1 for c in matrix if c["status"] == "partial")
        return {
            "total_controls": total,
            "compliant": compliant,
            "non_compliant": non_compliant,
            "partial": partial,
            "compliance_rate": round((compliant / total) * 100, 1) if total else 0,
            "posture": "compliant" if non_compliant == 0 and partial == 0 else "at_risk" if non_compliant > 0 else "partial",
        }

    async def get_risk_heatmap(
        self, db: AsyncSession, *, tenant_id: str
    ) -> Dict[str, Any]:
        matrix = await self.get_matrix(db, tenant_id=tenant_id)
        heatmap: Dict[str, Dict[str, int]] = {}
        for c in matrix:
            cat = c["category"] or "unknown"
            risk = c["risk_level"] or "medium"
            if cat not in heatmap:
                heatmap[cat] = {}
            heatmap[cat][risk] = heatmap[cat].get(risk, 0) + 1
        return {"heatmap": heatmap, "total_controls": len(matrix)}


saudi_compliance_matrix = SaudiComplianceMatrix()
