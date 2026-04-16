# Operating Plane Enterprise Checklist — Track 7

> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md)  
> **Plane**: Operating | **Version**: 1.0

---

## Objective

Make Dealix enterprise-saleable by implementing production-grade delivery, security, and provenance controls.

---

## GitHub Repository Governance

| Control | Status | Priority | Action Required |
|---------|--------|----------|----------------|
| Protected `main` branch | Target | P1 | Enable branch protection rules |
| Required CI checks before merge | Target | P1 | Set backend + frontend as required |
| Required code review (1+ approver) | Target | P1 | Enable in branch protection |
| CODEOWNERS file | Target | P1 | Create file mapping dirs to owners |
| Rulesets (GitHub) | Target | P2 | Configure rulesets for main + release branches |
| Environments (staging, production) | Target | P2 | Create GitHub environments |
| Deployment protection rules | Target | P2 | Required reviewers for production |
| Signed commits | Target | P3 | Enable commit signing requirement |
| Secret scanning | Target | P1 | Enable GitHub secret scanning |
| Dependabot | Target | P2 | Enable for Python + Node dependencies |

---

## CI/CD Pipeline

### Current State
- GitHub Actions workflow: `dealix-ci.yml`
- Jobs: `backend` (Python 3.12, pytest) + `frontend` (Node 22, lint + build + Playwright)
- Triggers: Push to main, PRs targeting main (salesflow-saas/ changes)

### Required Enhancements

| Enhancement | Priority | Status |
|-------------|----------|--------|
| Make CI checks required for merge | P1 | Target |
| Add `architecture_brief.py` to CI | P1 | Target |
| Add security scan (SAST) | P1 | Target |
| Add dependency vulnerability scan | P2 | Target |
| Add license compliance check | P3 | Target |
| Container image scanning | P2 | Target |
| Performance regression tests | P3 | Target |

---

## Authentication & Identity

| Control | Current | Target |
|---------|---------|--------|
| JWT authentication | Production | Production |
| Role-based access (RBAC) | Production | Production |
| Multi-factor auth (MFA) | Not implemented | P2 |
| OIDC for CI/CD | Not implemented | P2 — eliminate long-lived cloud secrets |
| SSO (enterprise) | Not implemented | P3 — Keycloak when customer demands |
| API key management | Production (`APIKey` model) | Production |

---

## Artifact Provenance

| Control | Current | Target | Notes |
|---------|---------|--------|-------|
| Docker image tagging | Manual | Automated (SHA-based) | Link image to commit |
| Artifact attestations | Not implemented | P2 | Requires GitHub Enterprise for private repos |
| SBOM generation | Not implemented | P2 | Software Bill of Materials |
| Container signing | Not implemented | P3 | Sigstore/cosign |

---

## Audit & Compliance

| Control | Current | Target |
|---------|---------|--------|
| Application audit logs | Production (`audit_log.py`) | Production |
| Consent audit trail | Production (`PDPLConsentAudit`) | Production |
| AI conversation logs | Production (`ai_conversations`) | Production |
| GitHub audit log | Default retention | P2 — external streaming for long retention |
| Centralized log aggregation | Not implemented | P2 — ELK/Loki/CloudWatch |
| Log retention policy | Not defined | P2 — define per data classification |

---

## Monitoring & Alerting

| Component | Current | Target |
|-----------|---------|--------|
| Application metrics | Prometheus (basic) | P1 — full RED metrics |
| Error tracking | Sentry (configured) | Production |
| Structured logging | StructLog (configured) | Production |
| Uptime monitoring | Not implemented | P1 — health endpoint monitoring |
| SLA monitoring | `sla_escalation_alerts.py` | Production |
| Connector health | `connector_governance.py` | Partial — needs live probes |
| Model routing metrics | `model_routing_dashboard.py` | Partial — needs live collection |

---

## Deployment

| Control | Current | Target |
|---------|---------|--------|
| Docker Compose (dev) | Production | Production |
| Kubernetes (production) | Not implemented | P2 |
| Blue/green deployment | Not implemented | P2 |
| Canary deployment | Feature flags exist | P2 — infra-level canary |
| Rollback procedure | Documented | Documented |
| Database backup | Not automated | P1 |
| Disaster recovery | Not documented | P2 |

---

## CODEOWNERS Template

```
# Default owner
* @VoXc2

# Backend
salesflow-saas/backend/ @VoXc2
salesflow-saas/backend/app/openclaw/ @VoXc2
salesflow-saas/backend/app/services/pdpl/ @VoXc2

# Frontend
salesflow-saas/frontend/ @VoXc2

# Governance
salesflow-saas/docs/governance/ @VoXc2
salesflow-saas/MASTER_OPERATING_PROMPT.md @VoXc2

# Security-sensitive
salesflow-saas/backend/app/services/auth_service.py @VoXc2
salesflow-saas/backend/app/services/security_gate.py @VoXc2
```

---

## Gate: Operating Plane Closure

- [ ] `main` branch protected with required checks
- [ ] CI runs `architecture_brief.py` as validation step
- [ ] CODEOWNERS file exists
- [ ] Secret scanning enabled
- [ ] One release gate is production-grade
- [ ] Provenance: every deployment links to commit SHA
- [ ] No long-lived cloud secrets where OIDC is possible
