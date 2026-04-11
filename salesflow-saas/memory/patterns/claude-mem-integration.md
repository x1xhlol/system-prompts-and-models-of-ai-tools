# claude-mem Integration — Dealix AI Revenue OS

**Date**: 2026-04-11 | **Status**: active | **Version**: 12.1.0

## What It Does

claude-mem automatically captures everything that happens during Claude Code sessions, compresses it using AI, and injects relevant context into future sessions. This gives the project **persistent memory across sessions**.

## How It Works

1. **SessionStart** → injects context from previous sessions (50 observations from last 10 sessions)
2. **UserPromptSubmit** → captures your prompts
3. **PostToolUse** → every tool execution generates a compressed observation
4. **Stop** → generates session summary (request, investigated, learned, completed, next steps)
5. **SessionEnd** → finalizes the session

## 3-Layer Token Retrieval

| Layer | What | Cost |
|-------|------|------|
| `search` | Compact index of titles/dates/types | ~50-100 tokens/result |
| `timeline` | Chronological context around observation | ~100-200 tokens/result |
| `get_observations` | Full observation records | ~500-1000 tokens/result |

This progressive approach saves ~10x tokens by filtering before fetching.

## Commands

```bash
npx claude-mem start      # Start worker
npx claude-mem stop       # Stop worker
npx claude-mem status     # Check status
npx claude-mem install    # Reinstall/update
```

In Claude Code: `/mem-search` to search past work

## Configuration

Settings at `~/.claude-mem/settings.json`:
- `CLAUDE_MEM_MODEL`: sonnet (default)
- `CLAUDE_MEM_CONTEXT_OBSERVATIONS`: 50
- `CLAUDE_MEM_CONTEXT_SESSION_COUNT`: 10
- `CLAUDE_MEM_PROVIDER`: claude

## Data Location

```
~/.claude-mem/
├── claude-mem.db          # SQLite database
├── settings.json          # Configuration
├── chroma/                # Vector embeddings
└── logs/                  # Worker logs
```

## Privacy

Wrap sensitive content in `<private>...</private>` tags to prevent storage.

## Integration with Dealix

claude-mem works as a global Claude Code plugin. It automatically hooks into ALL sessions regardless of project. No per-project configuration needed.

Benefits for Dealix:
- Remembers architecture decisions across sessions
- Tracks bugs fixed and patterns discovered
- Preserves context about Saudi market learnings
- Reduces token usage by ~95% for repeated context
