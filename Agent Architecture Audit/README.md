# Agent Architecture Audit

A diagnostic framework for auditing the health of any AI agent system.

**The base model rarely fails. The wrapper architecture corrupts good answers into bad behavior.**

This repository collects system prompts from dozens of AI coding agents and tools. This audit framework lets you inspect those prompts — and the systems that use them — for hidden failures that structural checks miss.

## Quick Start

Audit any agent system by checking its system prompt, tool definitions, memory layer, and execution loop against these failure patterns.

Run these grep commands against any agent codebase or prompt collection:

```bash
# Hardcoded secrets in prompts or configs
rg "sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{36}|AKIA[0-9A-Z]{16}" --type md --type json --type yaml

# Tool requirements in prompt only (no code gate)
rg "must.*tool|required.*call|always.*use.*tool" --type md --type txt

# Hidden LLM calls outside main agent loop
rg "completion|chat\.create|messages\.create|llm\.invoke" --type py --type ts

# Unrestricted code execution without sandbox
rg "exec\(|eval\(|subprocess\.(run|Popen)|os\.system\(" --type py -n

# Memory admission without user priority
rg "memory.*admit|long.*term.*update|persist.*memory" --type py --type ts

# Missing error handling on agent paths
rg "while.*agent|for.*turn|agent.*loop" --type py --type ts -A 3 | rg -v "max_|limit|break"

# Output mutation in delivery layer
rg "mutate.*response|rewrite.*output|transform.*answer" --type py --type ts

# Unbounded memory/context growth
rg "add.*memory|upsert.*vector|append.*context" --type py --type ts -A 3 | rg -v "max_|limit|ttl|trim"

# Missing observability (absence check)
rg "langsmith|langfuse|opentelemetry|callback|tracer" --type py --type ts

# State mutators without upstream validation
rg "file.*write|db.*insert|vector.*upsert" --type py --type ts -B 5 | rg -v "validate|guard|filter"
```

## The 12-Layer Stack

Every agent system has these layers. Any of them can corrupt the answer:

| # | Layer | What Goes Wrong |
|---|-------|----------------|
| 1 | System prompt | Conflicting instructions, instruction bloat |
| 2 | Session history | Stale context from previous turns |
| 3 | Long-term memory | Pollution across sessions |
| 4 | Distillation | Compressed artifacts re-entering as pseudo-facts |
| 5 | Active recall | Redundant re-summary layers wasting context |
| 6 | Tool selection | Wrong tool routing, model skips required tools |
| 7 | Tool execution | Hallucinated execution — claims to call but doesn't |
| 8 | Tool interpretation | Misread or ignored tool output |
| 9 | Answer shaping | Format corruption in final response |
| 10 | Platform rendering | UI/API/CLI mutates valid answers |
| 11 | Hidden repair loops | Silent fallback/retry agents running second LLM pass |
| 12 | Persistence | Expired state or cached artifacts reused as live evidence |

## Common Failure Patterns

### 1. Wrapper Regression

The base model works fine via direct API call, but the wrapper agent breaks it.

**Symptoms:**
- Model works fine in playground, breaks in the agent
- Added a new prompt layer, existing behavior degraded
- Agent sounds confident but is confidently wrong

### 2. Memory Contamination

Old topics leak into new conversations through history, memory retrieval, or distillation.

**Symptoms:**
- Agent brings up unrelated past topics
- User corrections don't stick (old memory overwrites new)
- Same-session artifacts re-enter as pseudo-facts

### 3. Tool Discipline Failure

Tools are declared in the prompt but not enforced in code. The model skips them or hallucinates execution.

**Symptoms:**
- "Must use tool X" in prompt, but model answers without calling it
- Tool results look correct but were never actually executed

### 4. Rendering/Transport Corruption

The agent's internal answer is correct, but the platform layer mutates it during delivery.

**Symptoms:**
- Logs show correct answer, user sees broken output
- Hidden fallback agent quietly replaces the answer before delivery

### 5. Hidden Agent Layers

Silent repair, retry, summarization, or recall agents run without explicit contracts.

**Symptoms:**
- Output changes between internal generation and user delivery
- "Auto-fix" loops run a second LLM pass the user doesn't know about

## Severity Model

| Level | Meaning |
|-------|---------|
| `critical` | Agent can confidently produce wrong operational behavior |
| `high` | Agent frequently degrades correctness or stability |
| `medium` | Correctness usually survives but output is fragile or wasteful |
| `low` | Mostly cosmetic or maintainability issues |

## Fix Strategy

Default fix order (code-first, not prompt-first):

1. **Code-gate tool requirements** — enforce in code, not just prompt text
2. **Remove or narrow hidden repair agents** — make fallback explicit with contracts
3. **Reduce context duplication** — same info through prompt + history + memory + distillation
4. **Tighten memory admission** — user corrections > agent assertions
5. **Tighten distillation triggers** — don't compress what shouldn't be compressed
6. **Reduce rendering mutation** — pass-through, don't transform
7. **Convert to typed JSON envelopes** — structured internal flow, not freeform prose

## Report Template

```json
{
  "target_name": "agent-name",
  "symptoms": ["what the user reports"],
  "findings": [
    {
      "severity": "critical|high|medium|low",
      "title": "what went wrong",
      "source_layer": "which of the 12 layers",
      "mechanism": "how it happens",
      "root_cause": "deepest cause",
      "evidence_refs": ["file:line"],
      "recommended_fix": "what to change"
    }
  ],
  "ordered_fix_plan": [
    { "order": 1, "goal": "first thing to fix", "why_now": "why this comes first" }
  ]
}
```

## Anti-Patterns to Avoid

- ❌ Saying "the model is weak" without falsifying the wrapper first
- ❌ Saying "memory is bad" without showing the contamination path
- ❌ Letting a clean current state erase a dirty historical incident
- ❌ Treating markdown prose as a trustworthy internal protocol
- ❌ Accepting "must use tool" in prompt text when code never enforces it

## Full Audit Skill

For a comprehensive, production-tested audit skill with 10 code-level anti-patterns, 9 audit playbooks, and structured JSON report schema, see:

**[oh-my-agent-check](https://github.com/huangrichao2020/oh-my-agent-check)**

This skill has been integrated into production agent platforms including Langflow ([PR](https://github.com/langflow-ai/langflow/pull/12852)), GenericAgent ([PR](https://github.com/lsdefine/GenericAgent/pull/141)), superpowers ([PR](https://github.com/obra/superpowers/pull/1259)), Everything Claude Code ([PR](https://github.com/affaan-m/everything-claude-code/pull/1566)), and OpenCode ([PR](https://github.com/anomalyco/opencode/pull/24023)).
