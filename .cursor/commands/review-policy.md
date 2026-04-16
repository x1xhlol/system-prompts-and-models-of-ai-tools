# review-policy

Scan the current change or branch against the policy library before commit or PR.

## Required reading

1. [docs/governance/approval-policy.md](../../docs/governance/approval-policy.md) — A/R/S, Class A/B/C, evidence packs.
2. [docs/governance/trust-fabric.md](../../docs/governance/trust-fabric.md) — security gate, tool verification, audit.
3. [docs/governance/github-and-release.md](../../docs/governance/github-and-release.md) — branch and environment rules.
4. [docs/enterprise-readiness.md](../../docs/enterprise-readiness.md) — B2B checklist before promising enterprise posture.

## Output

Produce a short table:

| Item | Classification (A/R/S if applicable) | Action class (A/B/C) | Gap or OK |
|------|----------------------------------------|----------------------|-----------|

Flag any **Class B** work missing approval path, any **S2/S3** exposure to new tools/providers, and any **R2/R3** without HITL. Do not approve merge narration without mapping to evidence (tests, checklist, or run artifacts).
