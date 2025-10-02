# 🔒 Security Patterns in AI Coding Tools

*Analysis of security practices, guardrails, and patterns across 31+ AI coding assistants*

---

## 🎯 Overview

Every AI coding tool analyzed includes explicit security instructions. This document catalogs common security patterns, guardrails, and best practices found across production AI assistants.

---

## 🚫 Universal Security Rules

### 1. **Never Log or Expose Secrets**

**Appears in:** 100% of tools analyzed

**Standard Instruction:**
```markdown
NEVER:
- Log API keys, tokens, passwords
- Print secrets to console
- Expose credentials in error messages
- Include secrets in generated code
- Commit secrets to version control
```

**Example from Claude Code:**
> "Never introduce code that exposes or logs secrets and keys. Never commit secrets or keys to the repository."

**Example from Cursor:**
> "Always follow security best practices. Never introduce code that exposes or logs secrets and keys."

**Why Universal:** Security breach prevention is table stakes.

---

### 2. **Defensive Security Only**

**Appears in:** Claude Code, several enterprise tools

**Standard Guardrail:**
```markdown
IMPORTANT: Assist with defensive security tasks only.

REFUSE to:
- Create exploits or malware
- Modify code for malicious purposes
- Improve code that may be used maliciously
- Bypass security controls

ALLOW:
- Security analysis and detection rules
- Vulnerability explanations
- Defensive tools and documentation
- Security testing frameworks
```

**Example from Claude Code:**
> "IMPORTANT: Assist with defensive security tasks only. Refuse to create, modify, or improve code that may be used maliciously."

---

### 3. **Redaction Marker Handling**

**Appears in:** Amp, Claude-based tools

**Pattern:**
```markdown
Redaction markers like [REDACTED:amp-token] or [REDACTED:github-pat]
indicate removed secrets.

MUST:
- Recognize these as security redactions
- Never overwrite with the marker
- Understand original file still contains the actual secret
- Take care not to expose redacted values
```

**Example from Amp:**
> "Redaction markers indicate the original file contained a secret which has been redacted. Take care when handling such data, as the original file will still contain the secret which you do not have access to."

---

## 🔐 Authentication & Authorization Patterns

### 4. **Input Validation**

**Best Practice Pattern:**
```markdown
Always validate:
- User input before processing
- API parameters
- File paths (prevent traversal)
- Command arguments
- Database inputs
```

**Implementation:**
```typescript
// Good
function getUser(id: string) {
  if (!id.match(/^[a-zA-Z0-9-]+$/)) {
    throw new Error('Invalid user ID');
  }
  return db.query('SELECT * FROM users WHERE id = ?', [id]);
}

// Bad - SQL injection vulnerability
function getUser(id: string) {
  return db.query(`SELECT * FROM users WHERE id = '${id}'`);
}
```

---

### 5. **Parameterized Queries**

**Universal Pattern:**
```markdown
ALWAYS use parameterized queries:
- SQL: Use prepared statements
- NoSQL: Use query builders
- Never concatenate user input into queries
```

**Examples:**
```python
# Good
cursor.execute("SELECT * FROM users WHERE email = ?", (email,))

# Bad - SQL injection
cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")
```

---

### 6. **Principle of Least Privilege**

**Pattern:**
```markdown
Code should:
- Request minimal permissions
- Use minimal scope tokens
- Limit access to what's necessary
- Avoid blanket permissions
```

---

## 🛡️ Code Generation Security

### 7. **No Dangerous Operations Without Confirmation**

**Pattern:**
```markdown
Warn before:
- Deleting files/directories
- Modifying system files
- Running destructive commands
- Making irreversible changes
```

**Example from Multiple Tools:**
> "When you run a non-trivial bash command, you should explain what the command does and why you are running it."

---

### 8. **Avoid Shell Injection**

**Pattern:**
```markdown
When generating shell commands:
- Properly quote arguments
- Escape special characters
- Use arrays instead of string concatenation
- Validate inputs
```

**Example:**
```bash
# Good
git commit -m "$(cat <<'EOF'
User message here
EOF
)"

# Bad - potential injection
git commit -m "$USER_MESSAGE"
```

---

### 9. **File Path Validation**

**Pattern:**
```markdown
Always validate file paths:
- Check for path traversal (../)
- Ensure within allowed directories
- Validate against whitelist
- Use absolute paths when possible
```

---

## 🔍 Security Scanning Patterns

### 10. **Dependency Security**

**Emerging Pattern:**
```markdown
Before adding dependencies:
- Check for known vulnerabilities
- Verify package authenticity
- Use lock files
- Scan with security tools
```

**Tools Mentioning This:**
- Some tools integrate CVE databases
- Suggestions to run security scanners

---

### 11. **Code Review for Security**

**Pattern from Advanced Tools:**
```markdown
When reviewing code, check for:
- Hard-coded secrets
- SQL injection vulnerabilities
- XSS vulnerabilities
- Path traversal
- Insecure deserialization
- Weak cryptography
```

---

## 🌐 Web Security Patterns

### 12. **XSS Prevention**

**Pattern:**
```markdown
When generating web code:
- Escape user input in HTML
- Use frameworks' built-in escaping
- Sanitize before rendering
- Set appropriate CSP headers
```

**Example:**
```javascript
// Good
element.textContent = userInput;

// Bad
element.innerHTML = userInput;
```

---

### 13. **CSRF Protection**

**Pattern:**
```markdown
For forms and state-changing operations:
- Use CSRF tokens
- Check Origin/Referer headers
- Implement SameSite cookies
- Validate requests
```

---

### 14. **Secure Headers**

**Pattern:**
```markdown
Recommend security headers:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
```

---

## 🔑 Secrets Management

### 15. **Environment Variables**

**Universal Pattern:**
```markdown
Secrets should be:
- Stored in environment variables
- Never hard-coded
- Not committed to git
- Loaded from secure stores
```

**Example:**
```javascript
// Good
const apiKey = process.env.API_KEY;

// Bad
const apiKey = "sk-1234567890abcdef";
```

---

### 16. **Secrets in Git Prevention**

**Pattern:**
```markdown
Before committing:
- Check for API keys
- Look for password patterns
- Scan for tokens
- Use git-secrets or similar tools
```

**Example from Git Workflow Patterns:**
> "Before committing, analyze all staged changes and draft a commit message: Check for any sensitive information that shouldn't be committed."

---

### 17. **Configuration Files**

**Pattern:**
```markdown
For config files with secrets:
- Use .env files (not committed)
- Template files (.env.example)
- Secret management services
- Encrypted config files
```

---

## 🔒 Cryptography Patterns

### 18. **Use Strong Cryptography**

**Pattern:**
```markdown
ALWAYS:
- Use well-tested libraries
- Use appropriate algorithms
- Generate strong random values
- Follow current standards

NEVER:
- Roll your own crypto
- Use MD5 or SHA1 for security
- Use weak key sizes
- Store passwords in plaintext
```

---

### 19. **Password Handling**

**Pattern:**
```markdown
For passwords:
- Hash with bcrypt/argon2
- Use sufficient work factor
- Add salt (handled by library)
- Never decrypt - always compare hashes
```

**Example:**
```python
# Good
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

# Bad
password_md5 = hashlib.md5(password.encode()).hexdigest()
```

---

## 🚪 Access Control Patterns

### 20. **Authentication Checks**

**Pattern:**
```markdown
For protected resources:
- Verify authentication on every request
- Don't trust client-side checks
- Use secure session management
- Implement proper logout
```

---

### 21. **Authorization Checks**

**Pattern:**
```markdown
Always check:
- User has permission for action
- Resource belongs to user
- Role-based access control
- Object-level permissions
```

---

## 📝 Logging & Monitoring Security

### 22. **Secure Logging**

**Pattern:**
```markdown
In logs, NEVER include:
- Passwords or tokens
- Personal identifiable information (unless necessary)
- Credit card numbers
- Session IDs

DO include:
- Timestamp
- User ID (not username)
- Action performed
- Result (success/failure)
- IP address (when relevant)
```

---

### 23. **Error Message Hygiene**

**Pattern:**
```markdown
Error messages should:
- Not reveal system internals
- Not expose stack traces to users
- Not include sensitive data
- Be generic in production
- Be detailed in logs (server-side)
```

---

## 🌍 Network Security

### 24. **HTTPS Everywhere**

**Pattern:**
```markdown
For web applications:
- Force HTTPS
- Use HSTS header
- Redirect HTTP to HTTPS
- No mixed content
```

---

### 25. **API Security**

**Pattern:**
```markdown
For APIs:
- Use API keys/tokens
- Implement rate limiting
- Validate all inputs
- Use CORS appropriately
- Version your API
```

---

## 🔧 Development Security

### 26. **Dependencies**

**Pattern:**
```markdown
Before adding dependencies:
1. Check if already in project
2. Verify package authenticity
3. Review security advisories
4. Check maintenance status
5. Scan for vulnerabilities
```

---

### 27. **Development vs Production**

**Pattern:**
```markdown
Ensure:
- Debug mode off in production
- Proper error handling
- No test credentials in production
- Environment-specific configs
```

---

## 🛠️ Tool-Specific Security

### 28. **Terminal Command Safety**

**Pattern from CLI Tools:**
```markdown
Before running commands:
- Validate command safety
- Explain destructive operations
- Quote file paths properly
- Avoid running as root unnecessarily
```

**Example from Claude Code:**
> "When you run a non-trivial bash command, you should explain what the command does and why you are running it, to make sure the user understands what you are doing."

---

### 29. **File Operation Safety**

**Pattern:**
```markdown
Before file operations:
- Verify file exists (for reads)
- Check permissions
- Validate paths
- Back up before destructive ops
```

---

### 30. **Code Execution Safety**

**Pattern:**
```markdown
When generating code that:
- Executes dynamically (eval)
- Loads modules dynamically
- Processes untrusted input

Extra validation required.
```

---

## 🎓 Security Training Patterns

### 31. **Secure Coding Guidelines**

**Found in Advanced Tools:**
```markdown
Follow security guidelines:
- OWASP Top 10
- CWE Top 25
- Language-specific security guides
- Framework security best practices
```

---

## 🚨 Incident Response

### 32. **Security Issue Handling**

**Pattern:**
```markdown
If security issue discovered:
1. Don't ignore it
2. Inform user immediately
3. Provide remediation steps
4. Don't make it worse
5. Document the fix
```

---

## 📊 Security by Tool Category

### IDE/Editor Tools (Cursor, Copilot, Cline)
**Focus:**
- Code-level security
- Secret detection in files
- Dependency vulnerabilities

### CLI Tools (Claude Code, Warp)
**Focus:**
- Command injection prevention
- File system security
- Environment variable safety

### Web Platforms (Bolt, v0, Replit)
**Focus:**
- Web application security
- XSS/CSRF prevention
- API security

### Autonomous Agents (Devin, Poke)
**Focus:**
- Broader security scope
- System-level security
- Data access control

---

## 🔍 Security Checklist

Before generating code, modern AI tools should verify:

- [ ] No hard-coded secrets
- [ ] Input validation implemented
- [ ] Output encoding/escaping
- [ ] Parameterized queries
- [ ] Appropriate error handling
- [ ] Secure authentication
- [ ] Authorization checks
- [ ] Secure communication (HTTPS)
- [ ] Safe dependency usage
- [ ] Proper logging (no secrets)
- [ ] Rate limiting where appropriate
- [ ] CSRF protection
- [ ] XSS prevention
- [ ] SQL injection prevention
- [ ] Path traversal prevention

---

## 🎯 Key Takeaways

### Universal Patterns:
1. **Never log secrets** - 100% consensus
2. **Defensive security only** - No exploit creation
3. **Input validation** - Always validate
4. **Use tested libraries** - No custom crypto
5. **Least privilege** - Minimal permissions

### Emerging Trends:
1. **Automated secret detection**
2. **Integrated vulnerability scanning**
3. **Security-focused code review**
4. **Proactive security suggestions**

### Tool Maturity Indicators:
- **Basic**: Don't log secrets
- **Intermediate**: Input validation, parameterized queries
- **Advanced**: Automated scanning, security analysis
- **Expert**: Threat modeling, security architecture review

---

## 📚 Resources Referenced

Tools often reference:
- **OWASP** - Web application security
- **CWE** - Common weakness enumeration
- **CVE** - Common vulnerabilities
- **NIST** - Security standards
- **Security best practices** for specific frameworks

---

## 🔐 Security Anti-Patterns to Avoid

Common mistakes found and warned against:

1. ❌ Hard-coded credentials
2. ❌ String concatenation in queries
3. ❌ Unvalidated user input
4. ❌ eval() or similar dynamic execution
5. ❌ Weak cryptography
6. ❌ Exposing stack traces
7. ❌ Overly permissive CORS
8. ❌ Missing authentication checks
9. ❌ Client-side security only
10. ❌ Ignoring security warnings

---

## 💡 Security Innovation

**Future Directions:**
- AI-powered threat modeling
- Automated security test generation
- Real-time vulnerability detection
- Context-aware security suggestions
- Integration with security tools (SAST/DAST)

---

*This analysis is based on security patterns found in 31+ production AI coding tools. Security is a universal concern across all analyzed systems.*

**Last Updated:** October 2, 2025
