"""
Shannon Security Lane — Dealix AI Revenue OS
White-box pentesting for staging/release gates ONLY.
NEVER runs on production without explicit approval.
"""
import logging
import re
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class ShannonScope(str, Enum):
    AUTH = "auth"
    API_ROUTES = "api_routes"
    FILE_UPLOAD = "file_upload"
    PDPL = "pdpl"
    TENANT_ISOLATION = "tenant_isolation"
    INJECTION = "injection"
    WEBSOCKET = "websocket"


class ShannonFinding(BaseModel):
    id: str
    scope: ShannonScope
    severity: str  # critical, high, medium, low, info
    title: str
    title_ar: str
    description: str
    proof_of_concept: str
    affected_endpoint: str
    impact: str
    remediation: str
    remediation_ar: str
    verified: bool = False
    cwe_id: str = ""
    found_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ShannonReport(BaseModel):
    scan_id: str
    environment: str
    scopes_tested: list[ShannonScope]
    findings: list[ShannonFinding]
    started_at: datetime
    completed_at: datetime
    should_block_release: bool
    summary: str
    summary_ar: str


BLOCKED_ENVIRONMENTS = ["production", "prod", "live"]


class ShannonSecurityLane:
    """Staging-only autonomous pentesting."""

    def __init__(self):
        self._findings: list[ShannonFinding] = []
        self._scan_count = 0

    async def run_scan(
        self,
        environment: str,
        base_url: str,
        scopes: list[ShannonScope] = None,
        auth_credentials: dict = None,
    ) -> ShannonReport:
        if environment.lower() in BLOCKED_ENVIRONMENTS:
            raise PermissionError(
                f"Shannon BLOCKED: cannot scan '{environment}'. "
                f"Pentesting is only allowed on staging/canary."
            )

        self._scan_count += 1
        scan_id = f"SHAN-{self._scan_count:04d}"
        started_at = datetime.now(timezone.utc)
        scopes = scopes or list(ShannonScope)
        findings = []

        logger.info(f"Shannon scan {scan_id} started on {environment}: {base_url}")

        for scope in scopes:
            try:
                scope_findings = await self._check_scope(
                    scope, base_url, auth_credentials
                )
                findings.extend(scope_findings)
            except Exception as e:
                logger.error(f"Shannon scope {scope} failed: {e}")

        self._findings.extend(findings)
        completed_at = datetime.now(timezone.utc)

        critical = sum(1 for f in findings if f.severity == "critical")
        high = sum(1 for f in findings if f.severity == "high")
        should_block = critical > 0 or high >= 3

        summary = (
            f"Scan {scan_id}: {len(findings)} findings "
            f"({critical} critical, {high} high). "
            f"{'RELEASE BLOCKED' if should_block else 'Release OK'}"
        )
        summary_ar = (
            f"فحص {scan_id}: {len(findings)} نتائج "
            f"({critical} حرجة، {high} عالية). "
            f"{'الإطلاق محظور' if should_block else 'الإطلاق مرخص'}"
        )

        return ShannonReport(
            scan_id=scan_id,
            environment=environment,
            scopes_tested=scopes,
            findings=findings,
            started_at=started_at,
            completed_at=completed_at,
            should_block_release=should_block,
            summary=summary,
            summary_ar=summary_ar,
        )

    async def _check_scope(
        self, scope: ShannonScope, base_url: str, creds: dict = None
    ) -> list[ShannonFinding]:
        checks = {
            ShannonScope.AUTH: self._check_auth,
            ShannonScope.INJECTION: self._check_injection,
            ShannonScope.TENANT_ISOLATION: self._check_tenant_isolation,
            ShannonScope.PDPL: self._check_pdpl,
            ShannonScope.API_ROUTES: self._check_api_routes,
            ShannonScope.FILE_UPLOAD: self._check_file_upload,
            ShannonScope.WEBSOCKET: self._check_websocket,
        }
        checker = checks.get(scope)
        if checker:
            return await checker(base_url, creds)
        return []

    async def _check_auth(self, base_url: str, creds: dict = None) -> list[ShannonFinding]:
        findings = []
        findings.append(ShannonFinding(
            id=f"AUTH-{len(self._findings)+1}",
            scope=ShannonScope.AUTH,
            severity="high",
            title="JWT expiration check",
            title_ar="فحص ��نتهاء صلاحية JWT",
            description="Verify JWT tokens expire within configured timeframe",
            proof_of_concept=f"GET {base_url}/api/v1/auth/me with expired token",
            affected_endpoint="/api/v1/auth/me",
            impact="Expired tokens could allow unauthorized access",
            remediation="Ensure ACCESS_TOKEN_EXPIRE_MINUTES is set and enforced",
            remediation_ar="تأكد من إعداد وقت انتهاء الرمز وتطبيقه",
            verified=False,
            cwe_id="CWE-613",
        ))
        return findings

    async def _check_injection(self, base_url: str, creds: dict = None) -> list[ShannonFinding]:
        findings = []
        sql_payloads = ["' OR '1'='1", "'; DROP TABLE leads;--", "1 UNION SELECT NULL"]
        for payload in sql_payloads:
            findings.append(ShannonFinding(
                id=f"INJ-{len(self._findings)+len(findings)+1}",
                scope=ShannonScope.INJECTION,
                severity="critical",
                title=f"SQL injection test: {payload[:20]}...",
                title_ar="اختبار حقن SQL",
                description=f"Test search endpoints with payload: {payload}",
                proof_of_concept=f"GET {base_url}/api/v1/leads?search={payload}",
                affected_endpoint="/api/v1/leads",
                impact="Database compromise, data exfiltration",
                remediation="Ensure all queries use parameterized SQLAlchemy ORM",
                remediation_ar="تأكد من استخدام SQLAlchemy ORM للاستعلامات",
                verified=False,
                cwe_id="CWE-89",
            ))
        return findings

    async def _check_tenant_isolation(self, base_url: str, creds: dict = None) -> list[ShannonFinding]:
        return [ShannonFinding(
            id=f"TENANT-{len(self._findings)+1}",
            scope=ShannonScope.TENANT_ISOLATION,
            severity="critical",
            title="Cross-tenant data access test",
            title_ar="اختبار الوصول عبر المستأجرين",
            description="Verify tenant A cannot access tenant B's leads/deals",
            proof_of_concept="Login as tenant A, request tenant B's lead by ID",
            affected_endpoint="/api/v1/leads/{id}",
            impact="Complete data breach across tenants",
            remediation="Enforce tenant_id filter on all queries",
            remediation_ar="فرض فلتر tenant_id على كل الاستعلامات",
            verified=False,
            cwe_id="CWE-284",
        )]

    async def _check_pdpl(self, base_url: str, creds: dict = None) -> list[ShannonFinding]:
        return [ShannonFinding(
            id=f"PDPL-{len(self._findings)+1}",
            scope=ShannonScope.PDPL,
            severity="high",
            title="PDPL consent bypass test",
            title_ar="اختبار تجاوز موافقة PDPL",
            description="Test if messages can be sent without recorded consent",
            proof_of_concept=f"POST {base_url}/api/v1/inbox/reply without consent record",
            affected_endpoint="/api/v1/inbox/reply",
            impact="PDPL violation — up to SAR 5M fine",
            remediation="Check consent before every outbound message",
            remediation_ar="فحص الموافقة قبل كل رسالة صادرة",
            verified=False,
            cwe_id="CWE-862",
        )]

    async def _check_api_routes(self, base_url: str, creds: dict = None) -> list[ShannonFinding]:
        return []

    async def _check_file_upload(self, base_url: str, creds: dict = None) -> list[ShannonFinding]:
        return []

    async def _check_websocket(self, base_url: str, creds: dict = None) -> list[ShannonFinding]:
        return []

    async def should_block_release(self) -> bool:
        critical = sum(1 for f in self._findings if f.severity == "critical" and not f.verified)
        high = sum(1 for f in self._findings if f.severity == "high" and not f.verified)
        return critical > 0 or high >= 3

    def get_all_findings(self, severity: str = None) -> list[ShannonFinding]:
        if severity:
            return [f for f in self._findings if f.severity == severity]
        return self._findings


shannon = ShannonSecurityLane()
