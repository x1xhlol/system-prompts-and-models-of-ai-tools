"""
Security Gate — Dealix AI Revenue OS
Pre-release and runtime security verification.
Blocks risky actions and enforces compliance checks.
"""
import logging
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class GateDecision(str, Enum):
    PASS = "pass"
    WARN = "warn"
    BLOCK = "block"


class SecurityFinding(BaseModel):
    id: str
    category: str
    severity: Severity
    title: str
    description: str
    affected_file: Optional[str] = None
    affected_endpoint: Optional[str] = None
    recommendation: str
    found_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved: bool = False


class GateResult(BaseModel):
    decision: GateDecision
    findings: list[SecurityFinding] = []
    checked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    summary: str = ""


class SecurityGate:
    """
    Security verification gate for Dealix.
    Checks auth, PDPL, messaging, and API security.
    """

    def __init__(self):
        self._findings: list[SecurityFinding] = []

    def check_outbound_message(
        self,
        channel: str,
        recipient: str,
        tenant_id: str,
        has_consent: bool,
        consent_purpose: str = None,
    ) -> GateResult:
        findings = []
        if not has_consent:
            findings.append(SecurityFinding(
                id=f"MSG-{len(self._findings)+1}",
                category="pdpl",
                severity=Severity.CRITICAL,
                title="رسالة بدون موافقة PDPL",
                description=f"محاولة إرسال رسالة {channel} بدون موافقة مسجلة للعميل",
                recommendation="يجب الحصول على موافقة العميل قبل الإرسال",
            ))
        if channel == "whatsapp" and not recipient.startswith("+"):
            findings.append(SecurityFinding(
                id=f"MSG-{len(self._findings)+2}",
                category="validation",
                severity=Severity.MEDIUM,
                title="رقم واتساب غير صالح",
                description=f"الرقم {recipient} لا يبدأ بـ +",
                recommendation="استخدم التنسيق الدولي +966XXXXXXXXX",
            ))
        self._findings.extend(findings)
        critical = any(f.severity == Severity.CRITICAL for f in findings)
        return GateResult(
            decision=GateDecision.BLOCK if critical else GateDecision.PASS,
            findings=findings,
            summary=f"فحص الرسالة: {'محظور - بدون موافقة' if critical else 'مرخص'}",
        )

    def check_data_access(
        self,
        user_id: str,
        user_role: str,
        target_tenant_id: str,
        user_tenant_id: str,
        action: str,
    ) -> GateResult:
        findings = []
        if target_tenant_id != user_tenant_id and user_role != "admin":
            findings.append(SecurityFinding(
                id=f"ACC-{len(self._findings)+1}",
                category="authorization",
                severity=Severity.CRITICAL,
                title="محاولة وصول عبر المستأجرين",
                description=f"المستخدم {user_id} حاول الوصول لبيانات مستأجر آخر",
                recommendation="رفض الطلب وتسجيل المحاولة",
            ))
        if action in ("delete", "export") and user_role not in ("owner", "admin"):
            findings.append(SecurityFinding(
                id=f"ACC-{len(self._findings)+2}",
                category="authorization",
                severity=Severity.HIGH,
                title="إجراء محظور للدور الحالي",
                description=f"الدور {user_role} لا يملك صلاحية {action}",
                recommendation="ترقية الصلاحيات أو استخدام حساب مخول",
            ))
        self._findings.extend(findings)
        critical = any(f.severity == Severity.CRITICAL for f in findings)
        return GateResult(
            decision=GateDecision.BLOCK if critical else GateDecision.PASS,
            findings=findings,
            summary=f"فحص الوصول: {action} - {'محظور' if critical else 'مرخص'}",
        )

    def check_api_request(
        self,
        endpoint: str,
        method: str,
        has_auth: bool,
        user_role: str = None,
    ) -> GateResult:
        findings = []
        sensitive_patterns = ["/compliance", "/admin", "/tenant", "/users"]
        is_sensitive = any(p in endpoint for p in sensitive_patterns)
        if is_sensitive and not has_auth:
            findings.append(SecurityFinding(
                id=f"API-{len(self._findings)+1}",
                category="authentication",
                severity=Severity.CRITICAL,
                title="وصول لنقطة حساسة بدون مصادقة",
                description=f"{method} {endpoint} بدون JWT token",
                recommendation="إضافة مصادقة إلزامية",
            ))
        if is_sensitive and user_role and user_role not in ("owner", "admin"):
            findings.append(SecurityFinding(
                id=f"API-{len(self._findings)+2}",
                category="authorization",
                severity=Severity.HIGH,
                title="صلاحيات غير كافية",
                description=f"الدور {user_role} لا يملك وصول لـ {endpoint}",
                recommendation="تحقق من صلاحيات المستخدم",
            ))
        self._findings.extend(findings)
        critical = any(f.severity == Severity.CRITICAL for f in findings)
        return GateResult(
            decision=GateDecision.BLOCK if critical else GateDecision.PASS,
            findings=findings,
            summary=f"فحص API: {method} {endpoint}",
        )

    def check_release(self) -> GateResult:
        unresolved_critical = [
            f for f in self._findings
            if f.severity == Severity.CRITICAL and not f.resolved
        ]
        unresolved_high = [
            f for f in self._findings
            if f.severity == Severity.HIGH and not f.resolved
        ]
        if unresolved_critical:
            decision = GateDecision.BLOCK
            summary = f"محظور: {len(unresolved_critical)} مشاكل حرجة غير محلولة"
        elif unresolved_high:
            decision = GateDecision.WARN
            summary = f"تحذير: {len(unresolved_high)} مشاكل عالية غير محلولة"
        else:
            decision = GateDecision.PASS
            summary = "مرخص للإطلاق"
        return GateResult(
            decision=decision,
            findings=unresolved_critical + unresolved_high,
            summary=summary,
        )

    def get_all_findings(
        self, severity: Severity = None, resolved: bool = None
    ) -> list[SecurityFinding]:
        results = self._findings
        if severity:
            results = [f for f in results if f.severity == severity]
        if resolved is not None:
            results = [f for f in results if f.resolved == resolved]
        return results

    def resolve_finding(self, finding_id: str) -> bool:
        for f in self._findings:
            if f.id == finding_id:
                f.resolved = True
                return True
        return False


# Global singleton
security_gate = SecurityGate()
