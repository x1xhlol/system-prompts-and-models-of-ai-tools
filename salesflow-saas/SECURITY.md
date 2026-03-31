# Security Policy

## Reporting a Vulnerability

**Do not open a public issue.** Report vulnerabilities privately:

1. Email the maintainer directly, or
2. Use GitHub's private vulnerability reporting on this repository.

Include: description, reproduction steps, affected component, and severity estimate.

You will receive an acknowledgment within 48 hours and a resolution timeline within 7 days.

## Scope

The following categories are in scope for security reports:

| Category | Examples |
|----------|---------|
| **Authentication Bypass** | Token forgery, session hijacking, OAuth flaws |
| **Exposed Secrets** | Credentials, API keys, or tokens in code/logs/responses |
| **Remote Code Execution** | Injection via API inputs, template rendering, task queue |
| **Privilege Escalation** | Tenant cross-access, role bypass, admin impersonation |
| **Data Exposure** | PII leaks, unscoped queries, verbose error responses |
| **Commission Abuse** | Fraudulent affiliate attribution, payout manipulation |
| **Infrastructure Misconfiguration** | Open ports, default credentials, permissive CORS, debug mode in production |

## Out of Scope

- Denial of service via volumetric flooding
- Social engineering of team members
- Vulnerabilities in third-party services we do not control
- Reports without actionable reproduction steps

## Disclosure

We follow coordinated disclosure. We will credit reporters (with permission) once a fix is deployed.
