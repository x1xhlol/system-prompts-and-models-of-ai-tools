# Saudi/GCC Enterprise Readiness — Track 8

> **Parent**: [`saudi-compliance-and-ai-governance.md`](saudi-compliance-and-ai-governance.md)  
> **Plane**: Trust | **Tracks**: Compliance, Trust  
> **Version**: 1.0

---

## Objective

Transform compliance documentation into live, auditable controls that can be demonstrated to enterprise buyers and regulators.

---

## PDPL Operationalization

### Data Classification Scheme

| Classification | Definition | Examples | Handling |
|---------------|-----------|----------|---------|
| **Public** | Published information | Marketing content, public pages | No restrictions |
| **Internal** | Business operations | Analytics, reports, pipeline data | Tenant isolation |
| **Confidential** | Sensitive business data | Deal values, proposals, financials | Encryption + access control |
| **Restricted** | Regulated personal data | PII, consent records, health data | PDPL controls + audit + encryption |

### Processing Register (PDPL Article 29)

| Processing Activity | Data Categories | Legal Basis | Retention | Cross-border |
|---------------------|----------------|-------------|-----------|-------------|
| Lead capture | Name, phone, email, company | Legitimate interest + consent | Until deletion request | No |
| WhatsApp messaging | Phone, message content | Explicit consent | 24 months | Meta servers (US) — transfer control needed |
| Email outreach | Email, name | Explicit consent | 24 months | SendGrid (US) — transfer control needed |
| AI analysis | All lead data | Legitimate interest | With lead record | LLM provider APIs — anonymization recommended |
| Payment processing | Card data (tokenized) | Contract | Per Stripe retention | Stripe (US) — PCI-DSS handles |
| Affiliate tracking | Name, phone, bank details | Contract | Employment + 5 years | No |
| Analytics | Aggregated metrics | Legitimate interest | Indefinite (anonymized) | No |

### Data Residency Controls

| Data Type | Current Location | Target Location | Control |
|-----------|-----------------|-----------------|---------|
| Database (PostgreSQL) | Cloud provider | Saudi region | P1 — migrate to Saudi DC |
| Redis cache | Cloud provider | Saudi region | P1 — co-locate with DB |
| File storage | Cloud provider | Saudi region | P1 — Saudi S3-compatible |
| LLM API calls | US/Global | Evaluate Saudi-hosted | P2 — evaluate Groq/local options |
| WhatsApp messages | Meta servers | N/A (Meta infrastructure) | Transfer impact assessment |
| Email | SendGrid servers | N/A | Transfer impact assessment |

---

## NCA ECC Readiness

### Essential Cybersecurity Controls (ECC-1:2018 + 2024 update)

| Domain | Control Area | Dealix Status | Evidence |
|--------|-------------|---------------|----------|
| **Governance** | Cybersecurity policy | Partial | SECURITY.md + policy.py |
| **Governance** | Roles & responsibilities | Partial | CODEOWNERS (target) |
| **Defense** | Access control | Production | JWT + RBAC + tenant isolation |
| **Defense** | Cryptography | Partial | TLS in transit; at-rest TDE target |
| **Defense** | Network security | Partial | Docker network isolation |
| **Defense** | Application security | Production | Input validation, SAST (target) |
| **Resilience** | Incident management | Documented | Runbooks exist |
| **Resilience** | Business continuity | Target | DR plan needed |
| **Resilience** | Backup & recovery | Target | Automated backup needed |
| **Third Party** | Vendor management | Partial | Connector governance (new) |
| **Third Party** | Cloud security | Target | Cloud security posture |

---

## AI Governance Controls

### OWASP LLM Top 10 Checklist

| Risk | Control | Status |
|------|---------|--------|
| LLM01: Prompt Injection | Input sanitization + system prompt isolation | Partial |
| LLM02: Insecure Output | Output validation via Pydantic schemas | Production |
| LLM03: Training Data Poisoning | Not applicable (using external APIs) | N/A |
| LLM04: Model DoS | Rate limiting (`slowapi`) + timeout | Production |
| LLM05: Supply Chain | Model router with verified providers only | Production |
| LLM06: Sensitive Info Disclosure | No PII in prompts policy + audit | Partial |
| LLM07: Insecure Plugin Design | OpenClaw plugin contract + policy gate | Production |
| LLM08: Excessive Agency | Class B/C policy enforcement | Production |
| LLM09: Overreliance | HITL for all Class B actions | Production |
| LLM10: Model Theft | API keys in env vars, not in code | Production |

### NIST AI RMF Alignment

| Function | Activity | Dealix Implementation |
|----------|----------|----------------------|
| GOVERN | AI governance policies | MASTER_OPERATING_PROMPT.md + policy.py |
| MAP | AI use case inventory | AGENT-MAP.md (19 agents) |
| MEASURE | Performance monitoring | observability.py + model_routing_dashboard |
| MANAGE | Risk mitigation | Trust Plane + contradiction engine |

---

## Arabic-First End-to-End Path

### Target: WhatsApp Lead → Deal Close (Arabic)

```
1. WhatsApp message received (Arabic) → arabic_nlp.py detects Saudi dialect
2. Lead created with Arabic name/company → lead_service.py
3. AI qualification in Arabic → lead-qualification-agent.md
4. LeadScoreCard generated (Arabic reasoning) → structured_outputs.py
5. Approval to outreach (Class B) → approval_bridge.py
6. Arabic WhatsApp response → arabic-whatsapp-agent.md
7. Meeting booked (Arabic confirmation) → meeting_service.py
8. Proposal generated (Arabic) → proposal-drafting-agent.md
9. Contract sent for signature → esign_service.py
10. Evidence pack assembled → evidence_pack_service.py
11. Executive dashboard shows deal (Arabic) → executive-room.tsx
```

### Arabic Content Coverage

| Component | Arabic Support | Status |
|-----------|---------------|--------|
| Frontend UI labels | Full i18n (`ar.json`) | Production |
| Legal documents | 7 Arabic legal docs | Production |
| Agent prompts | Arabic WhatsApp agent | Production |
| Error messages | Partial | Target |
| Email templates | Arabic templates | Production |
| PDF reports | WeasyPrint RTL | Production |
| Compliance dashboard | Arabic control names | Production |

---

## Gate: Saudi/GCC Enterprise Readiness

- [ ] Arabic-first path works end-to-end for one flow
- [ ] PDPL processing register documented and live
- [ ] Data classification applied to at least one data flow
- [ ] NCA ECC gap analysis completed with remediation plan
- [ ] AI governance checklist included in release review process
- [ ] OWASP LLM Top 10 controls verified
- [ ] Saudi Compliance Dashboard shows real control data
