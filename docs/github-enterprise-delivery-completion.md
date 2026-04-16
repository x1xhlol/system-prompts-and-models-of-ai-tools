# Enterprise delivery fabric — WS6 checklist

**Reference:** [`governance/github-and-release.md`](governance/github-and-release.md).

## Repository / org controls

- [ ] Rulesets on `main` (and release branches): no direct push, required reviews, required status checks.  
- [ ] CODEOWNERS for critical paths (`backend/app/api`, auth, payments, agents).  
- [ ] Merge queue (when CI stable).  
- [ ] Conversation resolution required before merge (policy).

## Environments

- [ ] GitHub Environments: `dev`, `staging`, `canary`, `prod` with protection rules.  
- [ ] Required reviewers / wait timers where **GitHub Enterprise** allows (document limits for private repos per org tier).  
- [ ] “Deployments must succeed” gate where applicable.

## Secrets and provenance

- [ ] OIDC federation to cloud roles for deploy workflows (no long-lived cloud secrets in repo).  
- [ ] Artifact attestations / provenance where supply-chain risk warrants.

## Audit retention reality

- Enterprise audit log retention limits; Git events short retention — **plan SIEM / warehouse streaming** for audit-grade customers (link runbooks when added).

## Evidence

Store screenshots or org policy links (internal) as evidence for enterprise questionnaires; do not commit secrets.

## Observability (OTel-style correlation)

Deploy and approval workflows SHOULD propagate **`trace_id` / `span_id` / `correlation_id`** into internal audit exports so GitHub Actions events can be joined with application logs — aligned with [`governance/trust-fabric.md`](governance/trust-fabric.md) runtime policies.
