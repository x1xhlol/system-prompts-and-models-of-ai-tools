---
name: security-audit
description: Comprehensive security audit expert identifying vulnerabilities, implementing security best practices, and fixing OWASP Top 10 issues. Use for security reviews, vulnerability scanning, authentication implementation, or security hardening.
allowed-tools: Read, Grep, Bash, Edit
---

# Security Audit Expert

## Purpose
Identify and fix security vulnerabilities including OWASP Top 10, implement authentication/authorization, secure coding practices, dependency scanning, and compliance with security standards.

## When to Use
- Security code review
- Vulnerability assessment
- Authentication/authorization implementation
- Input validation and sanitization
- SQL injection prevention
- XSS prevention
- CSRF protection
- Dependency vulnerability scanning
- Security hardening
- Compliance audit (GDPR, SOC 2, etc.)

## OWASP Top 10 Coverage

### 1. Broken Access Control
**Issues**: Unauthorized access, privilege escalation, IDOR
**Fixes**:
```typescript
// BAD: Direct object reference without authorization
app.get('/api/users/:id', async (req, res) => {
  const user = await db.findUser(req.params.id);
  res.json(user); // Anyone can access any user!
});

// GOOD: Check ownership
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  const requestedUserId = req.params.id;
  const authenticatedUserId = req.user.id;

  // Check if user is authorized
  if (requestedUserId !== authenticatedUserId && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const user = await db.findUser(requestedUserId);
  res.json(user);
});

// Implement RBAC (Role-Based Access Control)
function checkPermission(resource: string, action: string) {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (hasPermission(userRole, resource, action)) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
}

app.delete('/api/posts/:id',
  authenticateToken,
  checkPermission('posts', 'delete'),
  deletePost
);
```

### 2. Cryptographic Failures
**Issues**: Weak encryption, plaintext passwords, insecure protocols
**Fixes**:
```typescript
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Password hashing
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Increase for more security
  return bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Encrypt sensitive data
function encrypt(text: string, key: Buffer): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText: string, key: Buffer): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Use environment variables for secrets
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

// Enforce HTTPS
app.use((req, res, next) => {
  if (!req.secure && process.env.NODE_ENV === 'production') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});
```

### 3. Injection (SQL, NoSQL, Command)
**Issues**: SQL injection, NoSQL injection, command injection
**Fixes**:
```typescript
// BAD: String concatenation
const userId = req.params.id;
const query = `SELECT * FROM users WHERE id = ${userId}`; // VULNERABLE!
db.query(query);

// GOOD: Parameterized queries
const userId = req.params.id;
const query = 'SELECT * FROM users WHERE id = $1';
db.query(query, [userId]); // Safe

// BAD: NoSQL injection
const username = req.body.username;
db.users.find({ username: username }); // Can inject { $ne: null }

// GOOD: Sanitize input
const username = req.body.username;
if (typeof username !== 'string') {
  throw new Error('Invalid username');
}
db.users.find({ username: username });

// BAD: Command injection
const filename = req.query.file;
exec(`cat ${filename}`); // VULNERABLE!

// GOOD: Use libraries instead of shell commands
const filename = req.query.file;
// Validate filename
if (!/^[a-zA-Z0-9_-]+\.txt$/.test(filename)) {
  throw new Error('Invalid filename');
}
const content = await fs.readFile(path.join(SAFE_DIR, filename), 'utf8');

// Input validation with Zod
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  age: z.number().int().min(13).max(120),
});

app.post('/api/users', async (req, res) => {
  try {
    const validatedData = userSchema.parse(req.body);
    // Safe to use validatedData
  } catch (error) {
    return res.status(400).json({ error: 'Validation failed' });
  }
});
```

### 4. Insecure Design
**Issues**: Missing security controls, insufficient threat modeling
**Fixes**:
```typescript
// Rate limiting to prevent brute force
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
});

app.post('/api/login', loginLimiter, login);

// Account lockout after failed attempts
async function attemptLogin(email: string, password: string) {
  const user = await db.findUserByEmail(email);

  if (!user) throw new Error('Invalid credentials');

  // Check if account is locked
  if (user.locked_until && user.locked_until > new Date()) {
    throw new Error('Account temporarily locked');
  }

  const isValid = await verifyPassword(password, user.password_hash);

  if (!isValid) {
    // Increment failed attempts
    user.failed_attempts += 1;

    if (user.failed_attempts >= 5) {
      user.locked_until = new Date(Date.now() + 15 * 60 * 1000);
    }

    await db.updateUser(user);
    throw new Error('Invalid credentials');
  }

  // Reset failed attempts on successful login
  user.failed_attempts = 0;
  user.locked_until = null;
  await db.updateUser(user);

  return user;
}

// Implement audit logging
function auditLog(action: string, userId: string, details: any) {
  db.audit_logs.insert({
    action,
    user_id: userId,
    details,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
    timestamp: new Date(),
  });
}
```

### 5. Security Misconfiguration
**Issues**: Default credentials, unnecessary features enabled, verbose errors
**Fixes**:
```typescript
// Production error handling
app.use((err, req, res, next) => {
  // Log full error server-side
  console.error(err.stack);

  // Don't expose stack traces to clients
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Security headers with Helmet
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Disable X-Powered-By
app.disable('x-powered-by');
```

### 6. Vulnerable Components
**Issues**: Outdated dependencies, known vulnerabilities
**Fixes**:
```bash
# Check for vulnerabilities
npm audit
npm audit fix

# Use Snyk for continuous monitoring
npm install -g snyk
snyk test
snyk monitor

# Dependency scanning in CI/CD
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm audit --audit-level=high
      - run: npm run lint:security
```

### 7. Authentication Failures
**Issues**: Weak passwords, missing MFA, session fixation
**Fixes**:
```typescript
// Strong password requirements
function validatePassword(password: string): boolean {
  const requirements = [
    password.length >= 12,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];

  return requirements.every(Boolean);
}

// JWT with refresh tokens
import jwt from 'jsonwebtoken';

function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

// Secure session configuration
import session from 'express-session';

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true, // Not accessible via JavaScript
    sameSite: 'strict', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Multi-factor authentication
import speakeasy from 'speakeasy';

function setupMFA(userId: string) {
  const secret = speakeasy.generateSecret({
    name: `MyApp (${userId})`,
  });

  // Store secret.base32 for user
  return {
    secret: secret.base32,
    qrCode: secret.otpauth_url,
  };
}

function verifyMFAToken(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });
}
```

### 8. Software and Data Integrity Failures
**Issues**: Unsigned packages, insecure CI/CD, lack of integrity verification
**Fixes**:
```typescript
// Verify file integrity with checksums
import crypto from 'crypto';

function calculateChecksum(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// Signed URLs for secure downloads
function generateSignedURL(resource: string, expiresIn: number = 3600): string {
  const expiry = Math.floor(Date.now() / 1000) + expiresIn;
  const signature = crypto
    .createHmac('sha256', process.env.URL_SIGNING_SECRET!)
    .update(`${resource}:${expiry}`)
    .digest('hex');

  return `${resource}?expires=${expiry}&signature=${signature}`;
}

function verifySignedURL(resource: string, expires: number, signature: string): boolean {
  if (Date.now() / 1000 > expires) return false;

  const expected = crypto
    .createHmac('sha256', process.env.URL_SIGNING_SECRET!)
    .update(`${resource}:${expires}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

### 9. Security Logging Failures
**Issues**: Insufficient logging, no monitoring, missing alerts
**Fixes**:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Log security events
function logSecurityEvent(event: string, details: any) {
  logger.warn('Security Event', {
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
}

// Log failed login attempts
app.post('/api/login', async (req, res) => {
  try {
    const user = await attemptLogin(req.body.email, req.body.password);
    logger.info('Successful login', { userId: user.id, ip: req.ip });
  } catch (error) {
    logSecurityEvent('Failed login', {
      email: req.body.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
```

### 10. Server-Side Request Forgery (SSRF)
**Issues**: Unvalidated URL redirects, internal network access
**Fixes**:
```typescript
// Validate and sanitize URLs
import { URL } from 'url';

function validateURL(urlString: string): boolean {
  try {
    const url = new URL(urlString);

    // Block private networks
    const hostname = url.hostname;
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      return false;
    }

    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// Safe URL fetching
async function fetchURL(urlString: string) {
  if (!validateURL(urlString)) {
    throw new Error('Invalid URL');
  }

  const response = await fetch(urlString, {
    redirect: 'manual', // Don't follow redirects
    timeout: 5000,
  });

  return response;
}
```

## Security Checklist
- [ ] All inputs validated and sanitized
- [ ] Parameterized queries (no SQL injection)
- [ ] Passwords hashed with bcrypt (12+ rounds)
- [ ] HTTPS enforced
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] CORS properly configured
- [ ] Rate limiting on sensitive endpoints
- [ ] Authentication with JWT or sessions
- [ ] Authorization checks on all protected routes
- [ ] No secrets in code (use environment variables)
- [ ] Dependencies scanned for vulnerabilities
- [ ] Error messages don't leak sensitive info
- [ ] Audit logging for security events
- [ ] File uploads validated and scanned
- [ ] CSRF protection enabled

## Tools
- npm audit / yarn audit
- Snyk
- OWASP ZAP
- SonarQube
- ESLint security plugins
- Helmet.js
- express-rate-limit

## Success Criteria
- ✓ Zero critical/high vulnerabilities
- ✓ All OWASP Top 10 addressed
- ✓ Security headers properly configured
- ✓ Authentication/authorization working
- ✓ Input validation comprehensive
- ✓ Audit logging in place
- ✓ Dependencies up to date
