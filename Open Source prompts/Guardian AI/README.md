# Guardian AI

**Type**: Multi-agent orchestration system (open source)
**Model**: Claude (Opus/Sonnet), also works with GPT, Gemini, Llama, Mistral
**Agents**: 57 specialized agents coordinated by a single orchestrator
**Production**: 10,000+ tasks over 6+ months
**Source**: https://github.com/milkomida77/guardian-agent-prompts

## Prompts in this directory

| File | Description |
|------|-------------|
| orchestrator-system-prompt.txt | The main orchestrator that routes all 57 specialized agents. Representative examples shown — the full system coordinates 57 specialized agents across 15+ domains. Handles task decomposition, anti-duplication, quality gates, and parallel agent execution. |

## Architecture

Guardian uses a hub-and-spoke model:
- **1 Orchestrator** (this prompt) routes ALL incoming tasks
- **57 Specialized Agents** handle specific domains (code, security, trading, OSINT, business, VRChat, cloud, memory, quality, and 15+ other categories)
- **Task Registry** prevents duplicate work across agents
- **Quality Gates** require verification evidence before marking tasks done
- **Knowledge Graph** provides persistent memory across sessions

## Key Patterns

1. **Identity + NOT-block**: Each agent defines what it IS and what it IS NOT (~35% reduction observed in production testing)
2. **Task Registry**: SQLite-based anti-duplication with similarity matching
3. **Setup Master**: Every task gets a blueprint before delegation (agents, tools, risks, order)
4. **Quality Gate**: Agent output is a CLAIM; test output is EVIDENCE
5. **30-minute Heartbeat**: Orchestrator checks progress and reassigns stale tasks

## Differences from other agent systems

| Feature | Guardian | Common Open-Source Agent Frameworks |
|---------|----------|------------------------|
| Prompt length | 200-800 lines | 20-50 lines |
| Constraint ratio | 20-30% | <5% |
| NOT-blocks | Every agent | Rare |
| Task registry | Built-in | Not included |
| Quality gates | Mandatory | Optional |
| Error handling | Explicit per failure mode | Generic retry |
