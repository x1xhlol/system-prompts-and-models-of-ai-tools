# PDPL Compliance Checklist

**Type**: security
**Date**: 2026-04-11
**Status**: active
**Owner**: compliance team

## Pre-Launch Requirements

### Consent Management
- [ ] Consent recorded before any data processing
- [ ] Consent purpose is specific (marketing/sales/service/analytics)
- [ ] Consent channel tracked (WhatsApp/email/SMS/phone)
- [ ] Re-consent triggered when purpose changes
- [ ] Consent expiry enforced (12 months default)
- [ ] Consent audit trail complete

### Data Subject Rights
- [ ] Right to access: export all personal data as JSON
- [ ] Right to correction: update with audit trail
- [ ] Right to deletion: soft-delete + 30-day hard-delete
- [ ] Right to restrict processing: flag and enforce
- [ ] Response within 30 days of request

### Cross-Border Transfer
- [ ] All data stored in Saudi/GCC data centers
- [ ] No personal data sent to non-adequate countries without consent
- [ ] Transfer safeguards documented

### Security
- [ ] Data encryption at rest (PostgreSQL TDE or app-level)
- [ ] Data encryption in transit (TLS 1.3)
- [ ] Access control: role-based, tenant-isolated
- [ ] Audit logs for all data access
- [ ] Breach notification procedure documented

### Penalties
- Up to SAR 5,000,000 per violation
- Double for repeat offenses
- Up to 1 year imprisonment for unauthorized cross-border transfers

## SDAIA Registration
- [ ] Register on National Data Governance Platform
- [ ] Appoint Data Protection Officer
- [ ] Document processing activities
- [ ] Conduct Data Protection Impact Assessment
