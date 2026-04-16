# Saudi Compliance & AI Governance

> **Parent**: [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md)  
> **Plane**: Trust | **Tracks**: Compliance, Trust  
> **Version**: 1.0 | **Status**: Canonical

---

## Overview

Dealix operates as a Saudi-first platform. Compliance is not optional or aspirational — it is enforced at the system level. This document defines the regulatory landscape and how each regulation maps to live controls.

---

## 1. PDPL — Personal Data Protection Law

**Authority**: SDAIA (Saudi Data & AI Authority)  
**Penalty**: Up to SAR 5,000,000 per violation

### Control Matrix

| Control ID | Control | Implementation | Status |
|-----------|---------|----------------|--------|
| PDPL-C01 | Consent before outbound messaging | `pdpl/consent_manager.py` — check before every send | Live |
| PDPL-C02 | Consent purpose and channel tracking | `Consent` model — channel, source, opted_in_at | Live |
| PDPL-C03 | Auto-expire consent (12 months) | `consent_manager.py` — expiry check | Live |
| PDPL-C04 | Data subject access rights | `pdpl/data_rights.py` — export personal data | Live |
| PDPL-C05 | Data subject correction rights | `pdpl/data_rights.py` — update records | Live |
| PDPL-C06 | Data subject deletion rights | `pdpl/data_rights.py` — soft delete + anonymize | Live |
| PDPL-C07 | Data subject restriction rights | `pdpl/data_rights.py` — restrict processing | Live |
| PDPL-C08 | Breach notification procedures | Documented in `memory/security/pdpl-checklist.md` | Documented |
| PDPL-C09 | Cross-border transfer controls | Approval required for data leaving KSA | Documented |
| PDPL-C10 | Consent audit trail (immutable) | `PDPLConsentAudit` model — tracks all changes | Live |
| PDPL-C11 | Data minimization in logs | StructLog context scoping, no PII in logs | Live |
| PDPL-C12 | Encryption at rest | PostgreSQL TDE + application-level for PII | Planned |
| PDPL-C13 | Encryption in transit | TLS 1.3 for all connections | Live |
| PDPL-C14 | Privacy policy (Arabic) | `docs/legal/privacy-policy-ar.md` | Live |
| PDPL-C15 | Data protection policy (Arabic) | `docs/legal/data-protection-ar.md` | Live |
| PDPL-C16 | Cookie consent | `components/dealix/cookie-consent.tsx` | Live |

---

## 2. ZATCA — E-Invoicing

**Authority**: Zakat, Tax and Customs Authority  
**Requirement**: Phase 2 — Standard & Simplified E-Invoices

### Control Matrix

| Control ID | Control | Implementation | Status |
|-----------|---------|----------------|--------|
| ZATCA-C01 | VAT calculation (15%) | `zatca_compliance.py` — 15% rate | Live |
| ZATCA-C02 | Invoice format (XML/PDF-A3) | `zatca_compliance.py` — standard format | Live |
| ZATCA-C03 | Seller VAT/CR number validation | `zatca_compliance.py` — field validation | Live |
| ZATCA-C04 | SAR currency formatting | System-wide `DEFAULT_CURRENCY=SAR` | Live |
| ZATCA-C05 | Invoice UUID generation | UUID v4 per invoice | Live |
| ZATCA-C06 | QR code on simplified invoices | Planned | Planned |
| ZATCA-C07 | Integration with ZATCA sandbox | Planned | Planned |
| ZATCA-C08 | Credit/debit note support | Planned | Planned |

---

## 3. SDAIA — AI Governance

**Authority**: Saudi Data & AI Authority  
**Framework**: National AI Strategy + AI Ethics Principles

### Control Matrix

| Control ID | Control | Implementation | Status |
|-----------|---------|----------------|--------|
| SDAIA-C01 | AI decision explainability | Agent outputs include reasoning in `ai_conversations` | Live |
| SDAIA-C02 | Human-in-the-loop for high-risk decisions | Class B actions require approval_token | Live |
| SDAIA-C03 | Bias monitoring for Arabic NLP | Arabic NLP includes dialect detection | Partial |
| SDAIA-C04 | AI model documentation | Agent Map (`docs/AGENT-MAP.md`) documents all agents | Live |
| SDAIA-C05 | AI governance registration | Not yet registered | Planned |
| SDAIA-C06 | Responsible AI usage policy | Documented in AGENTS.md policy classes | Live |
| SDAIA-C07 | AI output quality monitoring | `conversation_qa_reviewer` agent | Live |
| SDAIA-C08 | Model performance tracking | `observability.py` tracks latency/errors | Live |

---

## 4. NCA — National Cybersecurity Authority

**Authority**: NCA  
**Framework**: Essential Cybersecurity Controls (ECC)

### Control Matrix

| Control ID | Control | Implementation | Status |
|-----------|---------|----------------|--------|
| NCA-C01 | Access control (RBAC) | JWT + role-based middleware | Live |
| NCA-C02 | Multi-tenant isolation | `tenant_id` scoping at ORM layer | Live |
| NCA-C03 | Authentication (MFA) | JWT auth live, MFA planned | Partial |
| NCA-C04 | Audit logging | `audit_log.py` — all state changes | Live |
| NCA-C05 | Incident response procedure | Documented in runbooks | Documented |
| NCA-C06 | Data residency (KSA) | Deployment target: Saudi data centers | Planned |
| NCA-C07 | Vulnerability management | `shannon_security.py` scanning | Live |
| NCA-C08 | Secure development lifecycle | CI/CD with tests, security checks | Live |
| NCA-C09 | Secrets management | Environment variables, never in code | Live |
| NCA-C10 | Network segmentation | Docker network isolation | Live |

---

## 5. Sector-Specific Regulations

### Real Estate
| Control | Status |
|---------|--------|
| Brokerage license verification | Planned |
| REGA (Real Estate General Authority) compliance | Planned |
| Commission disclosure requirements | Live (commission models) |

### Healthcare
| Control | Status |
|---------|--------|
| Patient data classification | Planned |
| MOH (Ministry of Health) data standards | Planned |
| Telemedicine regulations | Not applicable |

### Financial Services
| Control | Status |
|---------|--------|
| SAMA (Saudi Central Bank) reporting | Planned |
| AML/KYC integration | Planned |
| Payment card data (PCI-DSS posture) | Stripe handles (plugin) |

---

## 6. Data Residency & Transfer

| Requirement | Implementation | Status |
|------------|----------------|--------|
| Data stored in KSA | Target: Saudi cloud region | Planned |
| Cross-border transfer approval | Approval gate (Class B) | Designed |
| Data classification labels | Not implemented | Planned |
| Retention policies | Consent: 12 months auto-expire | Live (consent) |
| Right to erasure fulfillment | `pdpl/data_rights.py` | Live |

---

## 7. Arabic-First Compliance

All compliance-related content must be available in Arabic:

| Content | Arabic Version | Status |
|---------|---------------|--------|
| Privacy Policy | `docs/legal/privacy-policy-ar.md` | Live |
| Data Protection | `docs/legal/data-protection-ar.md` | Live |
| Consent Policy | `docs/legal/consent-policy-ar.md` | Live |
| Terms of Service | `docs/legal/terms-of-service-ar.md` | Live |
| Affiliate Rules | `docs/legal/affiliate-rules-ar.md` | Live |
| Commission Policy | `docs/legal/commission-policy-ar.md` | Live |
| Refund Policy | `docs/legal/refund-policy-ar.md` | Live |
| Compliance Dashboard | Frontend component | Building |

---

## 8. Live Compliance Matrix API

The Saudi Compliance Matrix is a live, queryable control system (not a static checklist).

**API Endpoints**:
- `GET /api/v1/compliance/matrix` — All controls with status
- `POST /api/v1/compliance/matrix/scan` — Run all live checks
- `GET /api/v1/compliance/matrix/{control_id}` — Control detail
- `GET /api/v1/compliance/risk-heatmap` — Category × severity matrix

**Live Checks**:
- PDPL consent coverage rate
- ZATCA invoice compliance rate
- Audit trail completeness
- Approval SLA compliance
- Secrets exposure scan
- Cross-tenant isolation test

Implementation: `services/saudi_compliance_matrix.py`, `models/compliance_control.py`
