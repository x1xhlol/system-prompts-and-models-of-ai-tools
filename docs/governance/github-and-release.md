# GitHub and release governance

**Canonical:** [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md).

Treat GitHub as a **governance surface**, not only file hosting.

## Repository rules

- **Protected branches** for `main` (and release branches if used).  
- **No direct push** to protected branches; work through PRs.  
- **Required reviews** and **required status checks** before merge.  
- **CODEOWNERS** as the team grows for critical paths.  
- **Conversation resolution** on review threads before merge where policy requires it.  
- **Signed commits** where org policy demands non-repudiation.  
- **Linear history** or merge strategy per team convention — document the choice.  
- **Merge queue** when CI is mature enough to serialize green merges.

## Environments and promotion

Use explicit promotion: **dev → staging → canary → prod** (names may vary; semantics must not).

- Deployment **protection rules** and environment **approvals** for production and production-like environments.  
- Gates aligned with [trust-fabric.md](trust-fabric.md) (security, tests, evidence).

## Security SDLC on GitHub

- Static analysis (SAST) on PRs where available.  
- **Dependency review** and automated update workflows (Renovate/Dependabot) with human policy for major bumps.  
- **Secret scanning** and push protection.  
- **Artifact provenance / attestations** where supply-chain risk warrants it.  
- **OIDC federation** to cloud deploy roles instead of long-lived cloud secrets when possible.

## Audit retention

Do not rely on GitHub (or any single SaaS) **retention alone** for audit-critical evidence. Plan streaming or export for long-lived audit trails where legal or enterprise customers require it.

## Go-live gate (fail-closed in CI)

`Dealix CI` runs [`salesflow-saas/scripts/check_go_live_gate.py`](../../salesflow-saas/scripts/check_go_live_gate.py) with **`DEALIX_CI_FAIL_ON_GO_LIVE=1`**: the job fails if the in-process `GET .../go-live-gate` response is not HTTP 200 or `launch_allowed` is not `true`. Local runs default to informational unless you pass `--strict` or set the same env var.

## Release readiness matrix — strict RC row (optional PR gate)

Workflow [`.github/workflows/release-readiness-rc-gate.yml`](../../.github/workflows/release-readiness-rc-gate.yml) runs on pull requests to `main` and executes `RELEASE_MATRIX_RC_ROW_REQUIRED=1 python scripts/check_release_readiness_matrix.py` when **either**:

- the PR has the label **`release-candidate`**, or  
- the PR diff touches **`docs/RELEASE_READINESS_MATRIX_AR.md`**.

Keep a documented **RC-…** summary row in that matrix (see the sample block in the file) so the strict check passes when you enable the gate.

## Dealix pointers

- CI workflows: `salesflow-saas/.github/` (if present) or repo-root `.github/`.  
- Local preflight: `salesflow-saas/verify-launch.ps1` delegating to `salesflow-saas/scripts/grand_launch_verify.ps1`.  
- Launch checklist: `salesflow-saas/docs/LAUNCH_CHECKLIST.md`.

See also: [approval-policy.md](approval-policy.md), [discovery-and-output-checklist.md](discovery-and-output-checklist.md).
