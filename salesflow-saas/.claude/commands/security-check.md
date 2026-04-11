# /security-check — Security Preflight for Dealix

Run a comprehensive security audit before deployment or PR merge.

## Steps

### 1. Hardcoded Secrets Detection
Scan all source files for embedded credentials:
```bash
grep -rn "API_KEY\s*=\s*['\"]" backend/app/ --include="*.py" | grep -v "os\.environ\|get_settings\|config\.\|settings\.\|# example\|# test"
grep -rn "SECRET\s*=\s*['\"]" backend/app/ --include="*.py" | grep -v "os\.environ\|get_settings\|config\.\|settings\.\|# example"
grep -rn "PASSWORD\s*=\s*['\"]" backend/app/ --include="*.py" | grep -v "os\.environ\|get_settings\|config\.\|settings\.\|# example\|hash_password"
grep -rn "PRIVATE_KEY\s*=\s*['\"]" backend/app/ --include="*.py" | grep -v "os\.environ\|get_settings"
grep -rn "Bearer\s\+[A-Za-z0-9_-]\{20,\}" backend/app/ --include="*.py"
```
Any match is a **CRITICAL** finding.

### 2. SQL Injection Vectors
Check for unsafe SQL construction:
```bash
grep -rn "f\".*SELECT\|f\".*INSERT\|f\".*UPDATE\|f\".*DELETE\|f'.*SELECT\|f'.*INSERT\|f'.*UPDATE\|f'.*DELETE" backend/app/ --include="*.py"
grep -rn "\.execute(f\"\|\.execute(f'" backend/app/ --include="*.py"
grep -rn "text(f\"\|text(f'" backend/app/ --include="*.py"
```
All SQL must use SQLAlchemy ORM or parameterized `text()` binds.

### 3. XSS Prevention
Check frontend for unsafe rendering:
```bash
grep -rn "dangerouslySetInnerHTML" frontend/src/ --include="*.tsx" --include="*.ts"
grep -rn "v-html" frontend/src/ --include="*.vue" 2>/dev/null
```
Flag each occurrence and verify input is sanitized.

### 4. PDPL Consent Verification
Check all message-sending endpoints enforce consent:
```bash
grep -rn "send_whatsapp\|send_sms\|send_email\|send_message" backend/app/api/ --include="*.py" -l
```
For each file found, verify it calls `ConsentManager.check_consent()` or `consent_manager.verify_consent()` before sending.

Check that personal data endpoints log access:
```bash
grep -rn "def get_lead\|def get_contact\|def export" backend/app/api/ --include="*.py" -l
```
Each must call `audit_service.log_access()` or equivalent.

### 5. JWT Validation
Verify JWT security configuration:
```bash
grep -rn "JWT_ALGORITHM\|jwt\.decode\|jwt\.encode" backend/app/ --include="*.py"
```
- Algorithm must be HS256 or RS256 (not `none`)
- Token expiry must be set (not unlimited)
- Secret key must come from environment, not hardcoded
- Refresh token rotation must be implemented

### 6. Tenant Isolation Audit
Check that all database queries enforce tenant boundaries:
```bash
grep -rn "def get\|def list\|def update\|def delete" backend/app/services/ --include="*.py" -l
```
For each service file, verify queries include `tenant_id` filter. Flag any query that accesses data without tenant scoping.

Check for cross-tenant data leakage in API responses:
- Ensure no endpoint returns data from multiple tenants
- Verify tenant_id is extracted from JWT, not from request body

### 7. Dependency Vulnerabilities
```bash
pip-audit -r backend/requirements.txt 2>/dev/null || echo "Run: pip install pip-audit"
cd frontend && npm audit --production 2>/dev/null || echo "Run npm audit manually"
```

### 8. File Upload Security
```bash
grep -rn "UploadFile\|file.*upload\|multipart" backend/app/ --include="*.py"
```
For each upload endpoint verify:
- Content-type validation (whitelist, not blacklist)
- File size limits enforced
- Files stored outside web root
- Filenames are sanitized (no path traversal)

### 9. Rate Limiting & Abuse Prevention
```bash
grep -rn "rate_limit\|throttle\|RateLimiter" backend/app/ --include="*.py"
```
Verify rate limiting on:
- Login / OTP endpoints
- Password reset
- API endpoints (per-tenant)
- WhatsApp message sending

### 10. Security Report
Generate a report with severity levels:
- **CRITICAL** — Must fix immediately (secrets, SQL injection, auth bypass)
- **HIGH** — Fix before release (missing consent checks, no tenant isolation)
- **MEDIUM** — Fix soon (missing rate limits, weak validation)
- **LOW** — Track for improvement (missing CSP headers, verbose errors)

Include specific file paths and line numbers for each finding.
