# ADR-002: WhatsApp as Primary Communication Channel

**Status**: accepted
**Date**: 2026-03-28
**Decision**: Build WhatsApp as a first-class CRM channel, not a third-party add-on

## Context
WhatsApp has 85%+ penetration in Saudi Arabia (30M+ users). It is THE primary business communication channel. Competitors (Salesforce, HubSpot) treat WhatsApp as a third-party integration.

## Decision
WhatsApp Business API is integrated directly into the core platform:
- Inbound webhooks create/update leads automatically
- AI chatbot handles initial qualification in Arabic
- Unified inbox merges WhatsApp with Email and SMS
- Sequences support WhatsApp as a step type
- Proposals can be sent and tracked via WhatsApp

## Rationale
- 85%+ of Saudi business communication happens on WhatsApp
- No global CRM treats WhatsApp as the primary channel
- This is Dealix's strongest competitive moat in KSA
- Close.com proved that building communication natively wins vs third-party

## Consequences
- Must maintain Meta Business API compliance
- Template messages need pre-approval from Meta
- 24-hour messaging window rules apply
- PDPL consent must be checked before every message
