# /release-prep — Release Preparation Checklist for Dealix

Prepare a release candidate. Run all checks and generate release notes.

## Steps

### 1. Run Full Test Suite
```bash
cd backend && pytest -v --tb=short 2>&1 | tail -30
```
All tests must pass. If any fail, list them and stop.

### 2. Lint & Format Check
```bash
cd backend && ruff check . --select E,W,F,I
cd backend && ruff format --check .
```
Fix any issues found.

### 3. Security Scan
- Grep for hardcoded secrets:
  ```bash
  grep -rn "API_KEY\|SECRET_KEY\|PASSWORD\|PRIVATE_KEY" backend/app/ --include="*.py" | grep -v "settings\.\|config\.\|get_settings\|os\.environ\|\.env"
  ```
- Check for known vulnerable dependencies:
  ```bash
  pip-audit -r backend/requirements.txt 2>/dev/null || echo "pip-audit not installed"
  ```

### 4. Database Migrations
- Check for pending migrations:
  ```bash
  cd backend && alembic heads
  cd backend && alembic current
  ```
- Verify migration chain is linear (no branch conflicts)
- Confirm all migrations have downgrade functions

### 5. Arabic Translation Completeness
- Scan frontend for untranslated strings:
  ```bash
  grep -rn "TODO.*translat\|FIXME.*arabic\|FIXME.*rtl" frontend/src/ --include="*.tsx" --include="*.ts"
  ```
- Check that all toast messages, error messages, and form labels have Arabic variants
- Verify RTL layout in key pages: dashboard, leads, deals, settings

### 6. Build Frontend
```bash
cd frontend && npm run build 2>&1 | tail -20
```
Build must complete without errors. Warnings are acceptable but should be noted.

### 7. Docker Build Verification
```bash
docker compose build --no-cache 2>&1 | tail -10
```
All services must build successfully.

### 8. Environment Variable Audit
Compare `.env.example` against required variables:
- Database: `DATABASE_URL`, `REDIS_URL`
- Auth: `JWT_SECRET_KEY`, `JWT_ALGORITHM`
- AI: `GROQ_API_KEY`, `OPENAI_API_KEY`
- WhatsApp: `ULTRAMSG_INSTANCE_ID`, `ULTRAMSG_TOKEN`
- Payments: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Monitoring: `SENTRY_DSN`

Verify no variable is empty or placeholder in production config.

### 9. Generate Release Notes
Based on commits since last tag:
```bash
git log $(git describe --tags --abbrev=0 2>/dev/null || echo "HEAD~20")..HEAD --oneline --no-merges
```

Organize into:
- **New Features** — user-facing capabilities
- **Improvements** — enhancements to existing features
- **Bug Fixes** — resolved issues
- **Security** — security-related changes
- **Infrastructure** — deployment, CI/CD, config changes
- **Breaking Changes** — anything requiring migration or config updates

### 10. Pre-release Summary
Output a go/no-go decision with:
- Test results (pass/fail count)
- Security findings
- Migration status
- Build status
- Outstanding risks or blockers
