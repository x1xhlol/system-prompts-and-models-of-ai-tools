# /review-pr — Pull Request Review for Dealix

Review the current PR branch against main. Perform a thorough multi-dimensional review.

## Steps

### 1. Identify Changes
```bash
git diff main...HEAD --stat
git diff main...HEAD --name-only
```
List all changed files grouped by area (backend, frontend, migrations, tests, config).

### 2. Code Quality
For each changed Python file:
- Check function length (flag any >40 lines)
- Check cyclomatic complexity (flag deeply nested logic)
- Verify type hints on all public function signatures
- Ensure docstrings on public classes and methods
- Verify consistent error handling (no bare `except:`)
- Check for `print()` statements that should be `logger.info()`

For each changed TypeScript/TSX file:
- Check component size (flag >200 lines)
- Verify prop types are defined
- Check for `any` type usage (should be avoided)
- Ensure error boundaries on async data fetching

### 3. Security Review
- No hardcoded secrets, API keys, or passwords
- SQL queries use parameterized statements (no f-string SQL)
- API endpoints have proper authentication decorators
- Tenant isolation: all DB queries filter by `tenant_id`
- File uploads validate content type and size
- No `eval()`, `exec()`, or `pickle.loads()` on user input
- JWT tokens validated on all protected routes
- CORS configuration is restrictive (not `*`)

### 4. PDPL Compliance
- Any new message-sending endpoint checks consent via `ConsentManager`
- Personal data access is audit-logged
- Data deletion endpoints exist for any new PII fields
- Consent purpose is specified for new data collection points
- No PII in log statements

### 5. Arabic String Validation
- All user-facing strings have Arabic translations
- Arabic text renders RTL correctly in frontend components
- Date/time formatting uses `Asia/Riyadh` timezone
- Currency displays as SAR with proper Arabic formatting
- Phone numbers accept Saudi format (+966)

### 6. Test Coverage
```bash
pytest --co -q  # List collected tests
```
- Every new API endpoint has at least one test
- Every new service method has unit tests
- Edge cases covered (empty input, invalid tenant, expired token)
- Async tests use `pytest-asyncio`

### 7. Database & Migrations
- New models include `tenant_id` column
- Alembic migration is reversible (has `downgrade()`)
- No destructive migrations on production data
- Indexes exist on frequently queried columns
- Foreign keys have proper cascade rules

### 8. Summary
Produce a structured review with:
- **Approve / Request Changes / Needs Discussion**
- Critical issues (must fix before merge)
- Warnings (should fix, not blocking)
- Suggestions (nice to have)
- Questions for the author
