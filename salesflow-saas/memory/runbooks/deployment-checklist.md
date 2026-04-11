# Deployment Checklist — Dealix

**Last Updated**: 2026-04-11
**Stack**: FastAPI + Next.js + PostgreSQL 16 + Redis + Celery

---

## Pre-Deploy

### 1. Database Migrations
```bash
# Check current migration state
cd backend && alembic current

# Verify migration chain has no branches
cd backend && alembic heads

# Run migrations on staging first
cd backend && alembic upgrade head

# Verify migration applied
cd backend && alembic current
```

- [ ] All migrations tested on staging with production-like data
- [ ] Destructive migrations (column drops, table deletes) have been reviewed
- [ ] Migration is reversible — `downgrade()` tested
- [ ] Large table migrations have been benchmarked for lock duration

### 2. Environment Variables
Verify all required variables are set in the target environment:

```bash
# Required — app will not start without these
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dealix
REDIS_URL=redis://host:6379/0
JWT_SECRET_KEY=<random-64-char-string>
JWT_ALGORITHM=HS256

# Required — core features break without these
GROQ_API_KEY=<groq-api-key>
OPENAI_API_KEY=<openai-api-key>
ULTRAMSG_INSTANCE_ID=<instance-id>
ULTRAMSG_TOKEN=<token>

# Required for billing
STRIPE_SECRET_KEY=<stripe-secret>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>

# Required for monitoring
SENTRY_DSN=<sentry-dsn>

# Optional
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASSWORD=<password>
```

- [ ] No placeholder values (`changeme`, `xxx`, `TODO`)
- [ ] Secrets are not shared between staging and production
- [ ] JWT_SECRET_KEY is unique per environment
- [ ] Database credentials use a dedicated app user (not `postgres` superuser)

### 3. Secrets Management
- [ ] All secrets stored in environment variables (not in code or config files)
- [ ] `.env` file is NOT committed to git (verify: `git ls-files .env`)
- [ ] Production secrets are in a secrets manager (AWS SSM, Vault, etc.)
- [ ] API keys have appropriate scope (not admin keys for read-only operations)

### 4. DNS & SSL
- [ ] Domain DNS points to the correct server IP
- [ ] SSL certificate is valid and not expiring within 30 days
- [ ] HTTPS redirect is configured in Nginx
- [ ] API subdomain configured (e.g., `api.dealix.sa`)
- [ ] CORS origins updated to match production domain

### 5. Backup Verification
- [ ] PostgreSQL automated backup is configured and tested
- [ ] Last backup restore test completed within the past 7 days
- [ ] Redis persistence enabled (AOF or RDB)
- [ ] Backup retention policy: minimum 7 days, recommended 30 days

---

## Deploy

### 1. Build & Deploy
```bash
# Pull latest code
git pull origin main

# Build all containers
docker compose build --no-cache

# Run migrations before starting the app
docker compose run --rm backend alembic upgrade head

# Start all services
docker compose up -d

# Verify all containers are running
docker compose ps
```

### 2. Health Checks
```bash
# Backend health
curl -f https://api.dealix.sa/api/v1/health || echo "BACKEND DOWN"

# Frontend health
curl -f https://app.dealix.sa/ || echo "FRONTEND DOWN"

# Database connectivity (via health endpoint)
curl -s https://api.dealix.sa/api/v1/health | python3 -c "
import sys, json
d = json.load(sys.stdin)
assert d.get('database') == 'ok', 'Database check failed'
print('Database: OK')
"

# Redis connectivity
curl -s https://api.dealix.sa/api/v1/health | python3 -c "
import sys, json
d = json.load(sys.stdin)
assert d.get('redis') == 'ok', 'Redis check failed'
print('Redis: OK')
"

# Celery worker
docker compose exec celery-worker celery -A app.workers inspect ping
```

- [ ] Backend returns 200 on `/api/v1/health`
- [ ] Frontend loads without JavaScript errors
- [ ] Database connection pool is healthy
- [ ] Redis is connected
- [ ] Celery worker is processing tasks

### 3. Smoke Tests
Run critical path tests against the deployed environment:

```bash
# Auth flow
curl -X POST https://api.dealix.sa/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "smoke-test@dealix.sa", "password": "test-password"}'

# Lead creation (with auth token)
TOKEN="<token-from-login>"
curl -X POST https://api.dealix.sa/api/v1/leads \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name": "اختبار", "phone": "+966501234567", "source": "smoke_test"}'

# WhatsApp connectivity check
curl -X POST https://api.dealix.sa/api/v1/integrations/whatsapp/test \
  -H "Authorization: Bearer ${TOKEN}"
```

- [ ] Login returns valid JWT token
- [ ] Lead creation succeeds with Arabic name
- [ ] WhatsApp integration responds
- [ ] Deal creation and pipeline update work
- [ ] File upload endpoint accepts and stores files

---

## Post-Deploy

### 1. Monitor Errors (First 30 Minutes)
- [ ] Watch Sentry for new errors: `https://sentry.io/organizations/dealix/`
- [ ] Check application logs: `docker compose logs -f backend --since 30m`
- [ ] Monitor Celery worker: `docker compose logs -f celery-worker --since 30m`
- [ ] Check for 5xx errors in Nginx access logs

### 2. Performance Verification
```bash
# Response time check (should be <500ms for API, <2s for pages)
time curl -s -o /dev/null -w "%{http_code} %{time_total}s" https://api.dealix.sa/api/v1/health
time curl -s -o /dev/null -w "%{http_code} %{time_total}s" https://app.dealix.sa/
```

- [ ] API P95 latency < 500ms
- [ ] Frontend initial load < 3s
- [ ] Database query time < 100ms for common operations
- [ ] No memory leaks (container memory stable after 15 minutes)

### 3. Verify Arabic UI
- [ ] Dashboard displays correctly in RTL layout
- [ ] Arabic text renders without encoding issues
- [ ] Date displays in Hijri/Gregorian as configured
- [ ] Currency shows as SAR with Arabic numerals option
- [ ] Phone input accepts +966 format
- [ ] Email notifications render Arabic correctly

### 4. Notify Stakeholders
- [ ] Post deployment status in team channel
- [ ] Update status page (if applicable)
- [ ] Notify affected customers of any breaking changes

---

## Rollback Procedure

### Immediate Rollback (< 5 minutes)
If critical issues are discovered post-deploy:

```bash
# 1. Stop current containers
docker compose down

# 2. Revert to previous code
git log --oneline -5  # Find the previous stable commit
git checkout <previous-commit-hash>

# 3. Rebuild and restart
docker compose build --no-cache
docker compose up -d

# 4. Verify rollback
curl -f https://api.dealix.sa/api/v1/health
```

### Database Rollback
If the migration caused issues:

```bash
# 1. Identify current and target revision
docker compose exec backend alembic current
docker compose exec backend alembic history --verbose | head -20

# 2. Downgrade to the previous revision
docker compose exec backend alembic downgrade -1

# 3. Verify
docker compose exec backend alembic current
```

**WARNING**: If the migration was destructive (dropped columns/tables), data may be lost. Restore from backup instead:

```bash
# Restore PostgreSQL from backup
pg_restore --clean --if-exists -d dealix /backups/dealix_<timestamp>.dump

# Verify data integrity after restore
docker compose exec backend python3 -c "
from sqlalchemy import text
from app.database import engine
with engine.connect() as conn:
    result = conn.execute(text('SELECT count(*) FROM leads'))
    print('Lead count:', result.scalar())
"
```

### Rollback Checklist
- [ ] Previous version is running and healthy
- [ ] Database is consistent (check foreign key integrity)
- [ ] No orphaned background tasks in Celery
- [ ] Caches cleared if schema changed: `docker compose exec redis redis-cli FLUSHDB`
- [ ] Stakeholders notified of rollback and timeline for fix

---

## Staging vs Production Differences

| Aspect | Staging | Production |
|--------|---------|------------|
| Domain | `staging.dealix.sa` | `app.dealix.sa` / `api.dealix.sa` |
| Database | `dealix_staging` | `dealix_production` |
| Stripe | Test mode keys | Live mode keys |
| WhatsApp | Sandbox instance | Production UltraMSG instance |
| Sentry | `staging` environment tag | `production` environment tag |
| AI Models | Lower-cost models OK | Production model configuration |
| Data | Synthetic test data | Real customer data |
| SSL | Let's Encrypt staging | Let's Encrypt production |
| Backups | Daily, 3-day retention | Hourly, 30-day retention |
| Scaling | Single instance | Load-balanced (when needed) |
| Feature flags | All enabled for testing | Controlled per-tenant |
| Logging | Debug level | Info level (debug on demand) |
