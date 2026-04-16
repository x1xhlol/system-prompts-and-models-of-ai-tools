# Repository discovery, phasing, and reporting checklist

**Canonical:** [`MASTER_OPERATING_PROMPT.md`](../../MASTER_OPERATING_PROMPT.md).

**Tier-1 bundle (tracks, radar, execution/trust specs, Saudi register, ADR gates):** [`../dealix-six-tracks.md`](../dealix-six-tracks.md), [`../blueprint-master-architecture.md`](../blueprint-master-architecture.md), [`../TIER1_MASTER_CLOSURE_CHECKLIST_AR.md`](../TIER1_MASTER_CLOSURE_CHECKLIST_AR.md), [`technology-radar-tier1.md`](technology-radar-tier1.md), [`execution-fabric.md`](execution-fabric.md), [`saudi-compliance-and-ai-governance.md`](saudi-compliance-and-ai-governance.md), [`../enterprise-readiness.md`](../enterprise-readiness.md).

**Cursor / Claude command parity:** أوامر الجذر في [`.cursor/commands/`](../../.cursor/commands/) يجب أن تعكس نفس التدفقات المذكورة في [`CLAUDE.md`](../../CLAUDE.md) (architecture-map، review-policy، generate-evidence، release-gate). عند إضافة أمر جديد، حدّث الملفين معًا.

## Before writing code

Produce a **code-backed** map (paths, modules, configs), not guesses:

- Frontend and backend stacks, APIs, DB models and migrations  
- Queues, workers, schedulers  
- Auth, permissions, tenant isolation  
- Messaging, CRM/lead integrations  
- AI modules, model/provider usage  
- `AGENTS.md`, `CLAUDE.md`, `.claude/`, Cursor rules, skills, hooks  
- Observability, CI/CD, deployment topology  
- Feature flags, admin tools, backup/restore  
- Security boundaries, long-running workflows, external integrations  
- **Current metric definitions** and audit/approval surfaces  

**Map first; do not code blindly.**

## Capability classification

Bucket capabilities into:

- **Verified** — proven in code + tests or production evidence  
- **Partial** — exists but incomplete or flaky  
- **Missing critical** — blocks safe scale or compliance  
- **Optional accelerators** — nice-to-have for this product type  
- **Community patterns** — adopt selectively after review  
- **Risky / experimental** — pilots only; out of default production path until benchmarked  

Deliver: architecture map, capability map, gap map, risk map, trust map, workflow map, opportunity map.

## Correct starting path (by product type)

- **SaaS** — scaffold hardening, auth, billing, admin, analytics, onboarding, release flow.  
- **AI / agentic** — provider routing, memory, orchestration, tool verification, evals, observability.  
- **CRM / lead / ops** — workflow safety, approvals, messaging controls, audit, connector facades, release gating.  
- **Strategic ops / partnerships / corpdev** — contracts, approvals, evidence packs, deterministic workflows, executive views, financial models.  

If several apply: **sequence explicitly**; do not interleave chaotically.

## Agent operating files (discipline)

Maintain: `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`, `.claude/settings.local.json` (gitignored when local-only), Cursor commands, skills, hooks. Encode: install/run/test, boundaries, forbidden actions, review and release expectations, memory rules, tools, providers, rollout, approvals, reversibility, evidence, **no claim without proof**.

## Decision plane outputs (summary)

Schema-first; provenance and freshness; decision memos and evidence packs; next-best-actions; alternatives; assumptions; machine-readable classifications.

Decision memo should support fields such as: objective, context, assumptions, recommendation, alternatives, financial impact, risk register, provenance/freshness/confidence scores, approval and reversibility classes, next action, rollback/compensation notes, evidence pack references.

**A decision memo without an evidence pack is incomplete** for governed work.

## Execution plane (summary)

Owns retries, idempotency, compensation, worker versioning, survival across failures. Used for approvals, contracts, partner activation, launches, diligence orchestration, DD rooms, signatures, PMI steps, release promotion, customer messaging **when approved**. Agents recommend; **only execution workflows commit**.

## Twenty-point reporting format

For major planning or review threads, structure output as:

1. Code-backed architecture map  
2. Verified capabilities  
3. Missing capabilities  
4. Gap map  
5. Safest integration points  
6. Target operating architecture  
7. Exact phase being executed  
8. File/module plan  
9. Contract/event plan  
10. Policy / approval / reversibility plan  
11. Testing plan  
12. Security gate plan  
13. Memory plan  
14. Provider routing plan  
15. Tool verification plan  
16. Design system decisions  
17. Rollout and rollback plan  
18. Evidence collected  
19. Unresolved risks  
20. Next safest step  

## Work style

Prefer small safe phases; be explicit about uncertainty; be strict about evidence; do not advance phases without proof.

## Arabic bootstrap (paste for Cursor sessions)

ابدأ بدون كتابة كود. أريد أولاً: (1) code-backed architecture map (2) verified capability map (3) gap map (4) safest integration points (5) target operating architecture (6) policy + approval + reversibility model (7) phased implementation plan. بعدها فقط: نفّذ المرحلة الأولى فقط؛ لا تنتقل للمرحلة التالية قبل evidence واضح؛ لا تفترض أي تكامل خارجي غير موجود فعليًا؛ افصل decision plane عن execution plane؛ عامل أي long-running commitment كـ deterministic workflow لا agent narration؛ عامل community catalogs كمكتبات أنماط؛ عامل memory products الواعدة كخيارات pilot تحتاج benchmark داخلي؛ عامل tool verification products كنمط معماري حتى تثبت صلاحيتها التشغيلية؛ لا تضع policy logic داخل prompts إذا كان مكانها الصحيح في policy system؛ لا تسمح بأي external commitment بدون approval class + reversibility class + evidence pack.

## Quick mechanical discovery

From repo root: `python scripts/architecture_brief.py` (or `py -3 scripts/architecture_brief.py` on Windows) — verifies key constitution and spine paths.

See also: [README.md](README.md), [planes-and-runtime.md](planes-and-runtime.md), [approval-policy.md](approval-policy.md).
