# /architecture-review — Architecture Review for Dealix

Review the codebase architecture for consistency, correctness, and maintainability.

## Steps

### 1. Service Boundary Analysis
Scan all services in `backend/app/services/`:
```bash
ls backend/app/services/*.py backend/app/services/*/*.py
```

For each service, check:
- **Single Responsibility**: Does it handle one domain concern or is it a grab bag?
- **Dependency Direction**: Services should depend on abstractions, not on each other circularly
- **Size**: Flag services over 500 lines as candidates for splitting
- **Naming**: Service name should match its domain (`lead_service.py` handles leads, not deals)

### 2. Import Cycle Detection
Check for circular imports between service modules:
```bash
grep -rn "^from app.services" backend/app/services/ --include="*.py"
grep -rn "^import app.services" backend/app/services/ --include="*.py"
```

Build a dependency graph and flag any cycles. Common problematic patterns:
- Service A imports Service B which imports Service A
- Circular through models: Service -> Model -> Service

### 3. Model Relationship Audit
Scan all SQLAlchemy models in `backend/app/models/`:
```bash
ls backend/app/models/*.py
```

For each model verify:
- Has `tenant_id` column (multi-tenancy requirement)
- Has `created_at` and `updated_at` timestamps
- Has `id` as UUID primary key
- Foreign keys reference correct tables
- Relationship `back_populates` are bidirectional and consistent
- No orphaned models (defined but never referenced)
- Indexes on `tenant_id` and frequently-queried columns

### 4. API Consistency Check
Scan all API routes in `backend/app/api/v1/`:
```bash
ls backend/app/api/v1/*.py
```

Verify consistency:
- **URL patterns**: all use kebab-case or snake_case (not mixed)
- **HTTP methods**: GET for reads, POST for creates, PUT/PATCH for updates, DELETE for deletes
- **Response format**: all return consistent JSON structure `{"data": ..., "message": ...}`
- **Error responses**: use standard error schema with status code and detail
- **Authentication**: all non-public routes have `Depends(get_current_user)`
- **Pagination**: list endpoints support `skip` and `limit` parameters
- **Tenant scoping**: tenant_id extracted from token, not URL

### 5. Configuration & Environment
Review `backend/app/config.py` or equivalent:
- All secrets from environment variables
- Sensible defaults for development
- No production values hardcoded
- Settings class uses Pydantic `BaseSettings`
- Separate configs for test/dev/staging/prod

### 6. Worker & Task Architecture
Review Celery workers in `backend/app/workers/`:
```bash
ls backend/app/workers/*.py 2>/dev/null
```

Check:
- Tasks are idempotent (safe to retry)
- Long tasks have timeout configuration
- Tasks log their execution for debugging
- Error handling with proper retry strategy
- No database sessions held across `await` boundaries

### 7. Frontend-Backend Contract
Compare API routes with frontend API calls:
```bash
grep -rn "fetch\|axios\|api\." frontend/src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".next"
```

Flag mismatches:
- Frontend calls endpoints that don't exist
- Request/response types don't match
- Missing error handling on frontend for known error responses

### 8. Integration Points
Review external integrations in `backend/app/integrations/`:
- WhatsApp adapter: retry logic, rate limiting, error handling
- Email service: template rendering, bounce handling
- Stripe: webhook verification, idempotency keys
- AI providers: fallback chain, timeout handling, cost tracking

### 9. Architecture Report
Produce a structured report:

| Area | Status | Issues Found | Recommendation |
|------|--------|-------------|----------------|
| Service Boundaries | | | |
| Import Cycles | | | |
| Model Integrity | | | |
| API Consistency | | | |
| Config Management | | | |
| Worker Architecture | | | |
| Frontend Contract | | | |
| Integrations | | | |

Include:
- Top 5 highest-priority architectural improvements
- Technical debt inventory with estimated effort
- Recommended refactoring sequence
