# generate-evidence

Build an **Evidence Pack** for the current task: link intent → claims → verification artifacts.

## Minimum contents

1. **Sources** — commits, files touched, PR link if any.
2. **Assumptions** — explicit list; mark unverified assumptions.
3. **Freshness** — timestamps or commit SHAs for docs and code reviewed.
4. **Verification** — commands run and results (e.g. `pytest`, `verify-launch`, lint); paste exit summary or log pointers.
5. **Contradictions** — any claim vs observed behavior; mark `contradicted` until resolved (see [docs/governance/trust-fabric.md](../../docs/governance/trust-fabric.md)).
6. **Rollback / compensation** — one paragraph for Class B or R1+ changes.

## Tie-in

- Decision memos must reference this pack: [docs/governance/approval-policy.md](../../docs/governance/approval-policy.md).
- Structured reporting: section 20-point list in [docs/governance/discovery-and-output-checklist.md](../../docs/governance/discovery-and-output-checklist.md).

Output as structured markdown or JSON-shaped bullets so machines and humans can scan it.
