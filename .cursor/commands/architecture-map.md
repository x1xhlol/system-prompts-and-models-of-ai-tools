# architecture-map

Run repository discovery spine check from repo root:

```bash
python scripts/architecture_brief.py
```

On Windows if `python` is missing from PATH:

```bash
py -3 scripts/architecture_brief.py
```

Then read and summarize:

- [MASTER_OPERATING_PROMPT.md](../../MASTER_OPERATING_PROMPT.md) (TOC + relevant sections for the task)
- [docs/ai-operating-model.md](../../docs/ai-operating-model.md)
- [docs/governance/README.md](../../docs/governance/README.md)

Output a **code-backed** bullet map: backend, frontend, agents, prompts path, launch/verify scripts, CI — citing real paths only (no guessed integrations).
