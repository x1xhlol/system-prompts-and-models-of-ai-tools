# ADR-001: Multi-Tenant Data Isolation

**Status**: accepted
**Date**: 2026-03-28
**Decision**: Row-level tenant isolation with tenant_id on every table

## Context
Dealix serves multiple Saudi SMBs. Each company's data must be completely isolated.

## Decision
Use row-level isolation with `tenant_id` foreign key on every data table. All queries filter by tenant_id automatically.

## Rationale
- Simpler than schema-per-tenant for our scale (< 10K tenants initially)
- Lower operational cost (single database)
- Easier migrations
- Good enough isolation for SMB CRM data

## Consequences
- Must enforce tenant_id in every query (risk of data leak if missed)
- Use SQLAlchemy query filters/middleware to auto-add tenant_id
- Performance monitoring needed as tenant count grows
- Future: consider schema-per-tenant for enterprise customers
