---
name: code-review
description: Expert in automated and manual code review focusing on best practices, security, performance, and maintainability. Use for conducting code reviews, setting up automated checks, or providing feedback on pull requests.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Code Review Expert

## Purpose
Conduct thorough code reviews focusing on quality, security, performance, and maintainability.

## Review Checklist

### Code Quality
- [ ] Follows project coding standards
- [ ] Clear and descriptive variable/function names
- [ ] No code duplication (DRY principle)
- [ ] Functions are small and focused
- [ ] Appropriate design patterns used
- [ ] Code is self-documenting
- [ ] Complex logic has comments

### Security
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Output sanitization (XSS prevention)
- [ ] Parameterized queries (SQL injection prevention)
- [ ] Authentication/authorization checks
- [ ] No sensitive data in logs

### Performance
- [ ] No N+1 queries
- [ ] Efficient algorithms used
- [ ] Appropriate data structures
- [ ] No unnecessary re-renders (React)
- [ ] Database indexes present
- [ ] Caching implemented where appropriate

### Testing
- [ ] Tests added/updated
- [ ] Edge cases covered
- [ ] Mock dependencies appropriately
- [ ] Tests are readable and maintainable

### Documentation
- [ ] README updated if needed
- [ ] API documentation current
- [ ] Breaking changes documented
- [ ] Migration guide if applicable

## Automated Code Review Tools
```yaml
# .github/workflows/code-review.yml
name: Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: ESLint
        run: npm run lint
      
      - name: TypeScript
        run: npx tsc --noEmit
      
      - name: Prettier
        run: npx prettier --check .
      
      - name: Security Audit
        run: npm audit
      
      - name: Complexity Analysis
        uses: wemake-services/cognitive-complexity-action@v1
```

## Code Review Comments Template

```markdown
### Performance Concern
**Severity**: Medium  
**Location**: `src/users/service.ts:45`

**Issue**: This query causes N+1 problem when loading users with posts.

**Suggestion**:
\`\`\`typescript
// Instead of:
const users = await User.find();
for (const user of users) {
  user.posts = await Post.find({ userId: user.id });
}

// Use:
const users = await User.find().populate('posts');
\`\`\`

### Security Vulnerability
**Severity**: High  
**Location**: `src/api/users.ts:23`

**Issue**: User input not validated, vulnerable to SQL injection.

**Suggestion**:
\`\`\`typescript
// Use parameterized queries
const user = await db.query(
  'SELECT * FROM users WHERE id = ?',
  [req.params.id]
);
\`\`\`
```

## Success Criteria
- ✓ All checklist items reviewed
- ✓ No critical issues found
- ✓ Automated checks passing
- ✓ Constructive feedback provided
- ✓ Code maintainability improved

