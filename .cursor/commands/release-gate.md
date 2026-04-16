# release-gate

Pre-flight before promotion to staging/canary/prod or before declaring a release candidate.

## Steps (run from repo root)

1. Backend tests:

   ```bash
   cd salesflow-saas/backend && pytest -v --tb=short
   ```

2. Launch / hardening script (Windows):

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File salesflow-saas/verify-launch.ps1
   ```

   Add flags as your runbook requires, e.g. `-WithOpenApiGate` — see [salesflow-saas/verify-launch.ps1](../../salesflow-saas/verify-launch.ps1).

3. Read [salesflow-saas/docs/LAUNCH_CHECKLIST.md](../../salesflow-saas/docs/LAUNCH_CHECKLIST.md) and tick mentally each item that applies.

4. Security gate mindset: [docs/governance/trust-fabric.md](../../docs/governance/trust-fabric.md) (auth, webhooks, uploads, AI surfaces, MCP).

## Output

Summarize pass/fail, open critical findings, and **block release** if any Class C violation or unresolved contradicted evidence remains.
