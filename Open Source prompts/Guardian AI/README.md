# Guardian AI

**Type**: Multi-agent orchestration system (open source)
**Model**: Claude (Opus/Sonnet), also works with GPT, Gemini, Llama, Mistral
**Agents**: 57 specialized agents coordinated by a single orchestrator
**Production**: 10,000+ tasks over 6+ months
**Source**: https://github.com/milkomida77/guardian-agent-prompts

## Prompts in this directory

| File | Description |
|------|-------------|
| orchestrator-system-prompt.txt | The main orchestrator that coordinates 57 specialized agents (10 representative categories shown in routing table). Handles task decomposition, anti-duplication, quality gates, and parallel agent execution. |

## Architecture

Guardian uses a hub-and-spoke model:
- **1 Orchestrator** (this prompt) routes ALL incoming tasks
- **57 Specialized Agents** handle specific domains (code, security, trading, OSINT, business, etc.)
- **Task Registry** prevents duplicate work across agents
- **Quality Gates** require verification evidence before marking tasks done
- **Knowledge Graph** provides persistent memory across sessions

## Key Patterns

1. **Identity + NOT-block**: Each agent defines what it IS and what it IS NOT (reduces task drift ~35%)
2. **Task Registry**: SQLite-based anti-duplication with similarity matching
3. **Setup Master**: Every task gets a blueprint before delegation (agents, tools, risks, order)
4. **Quality Gate**: Agent output is a CLAIM; test output is EVIDENCE
5. **30-minute Heartbeat**: Orchestrator checks progress and reassigns stale tasks

## Differences from other agent systems

| Feature | Guardian | Typical Agent Frameworks |
|---------|----------|------------------------|
| Prompt length | 200-800 lines | 20-50 lines |
| Constraint ratio | 20-30% | <5% |
| NOT-blocks | Every agent | Rare |
| Task registry | Built-in | Not included |
| Quality gates | Mandatory | Optional |
| Error handling | Explicit per failure mode | Generic retry |
