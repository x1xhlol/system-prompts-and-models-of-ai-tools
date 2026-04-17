# PR #16 merge reconcile checklist (Tier-1)

Use after merging [PR #16](https://github.com/VoXc2/system-prompts-and-models-of-ai-tools/pull/16) (`claude/dealix-tier1-completion-*`) into `main`.

## Goals

- **One** canonical copy for: operating constitution, Tier-1 closure lists, governance deep-dives.
- No conflicting `MASTER_OPERATING_PROMPT.md` (root vs `salesflow-saas/`).
- `scripts/architecture_brief.py` `CONSTITUTION_PATHS` lists only existing canonical files.

## Steps

1. Compare `MASTER_OPERATING_PROMPT.md` (root) vs `salesflow-saas/MASTER_OPERATING_PROMPT.md` — pick one winner; delete or symlink the loser; update [`SOURCE_OF_TRUTH_INDEX.md`](SOURCE_OF_TRUTH_INDEX.md).
2. Compare `salesflow-saas/docs/tier1-master-closure-checklist.md` vs root [`TIER1_MASTER_CLOSURE_CHECKLIST_AR.md`](TIER1_MASTER_CLOSURE_CHECKLIST_AR.md) — keep EN + AR pair with a single status column owner.
3. Re-run `python scripts/architecture_brief.py` and `python scripts/check_docs_links.py` from repo root.
4. Re-run `Dealix CI` (pytest + OpenAPI verify + governance scripts).
5. Update [`architecture-register.md`](architecture-register.md) if subsystem ownership moved.

## If you cannot merge yet

Keep PR #16 branch open; treat duplicate paths as **Shadow** per [`SOURCE_OF_TRUTH_INDEX.md`](SOURCE_OF_TRUTH_INDEX.md) until the merge completes.
