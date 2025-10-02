# Cursor AI

**Type:** IDE (VS Code Fork)  
**Availability:** Free + Pro ($20/month) + Business ($40/user/month)  
**Website:** https://cursor.com  
**GitHub:** cursor-ai/cursor

---

## 📋 Overview

Cursor is an AI-first code editor built as a fork of VS Code. It features:
- Multi-file editing with AI
- Codebase-aware chat
- Inline code generation
- Terminal integration
- Memory system for persistent context
- Multiple specialized modes (Chat, Agent, Composer)

---

## 📂 Files in This Directory

### System Prompts:
- **`Prompt.txt`** - Base chat prompt (generic)
- **`Chat Prompt.txt`** - Chat mode system instructions
- **`Agent Prompt.txt`** - Agent mode (autonomous task executor)
- **`Agent Prompt v1.0.txt`** - First agent mode version
- **`Agent Prompt v1.2.txt`** - Updated agent with improvements
- **`Agent Prompt 2025-09-03.txt`** - September 2025 iteration
- **`Agent CLI Prompt 2025-08-07.txt`** - CLI-optimized variant (August 2025)
- **`Memory Prompt.txt`** - Memory system instructions
- **`Memory Rating Prompt.txt`** - Memory importance scoring

### Tools:
- **`Agent Tools v1.0.json`** - Tool definitions for agent mode

---

## 🔍 Source

- **Official Documentation:** https://docs.cursor.com
- **Public Sources:** Community reverse engineering
- **Date Captured:** Multiple versions from July 2024 - September 2025
- **Attribution:** Cursor AI, Inc.

---

## 📊 Key Features in Prompts

### 1. **Conciseness Mandate**
Evolution visible across versions:
- **v1.0:** "Provide helpful explanations"
- **v1.2:** "Keep your answers short and impersonal"
- **CLI 2025-08:** "You MUST answer concisely with fewer than 4 lines"

### 2. **Multi-Agent Architecture**
Agent mode coordinates between:
- Main agent (planning, coordination)
- Task executors (implementation)
- Search agents (codebase discovery)

### 3. **Memory System**
Two-tier memory:
- **Short-term:** Conversation context
- **Long-term:** Persistent memories with importance ratings

### 4. **Parallel Execution**
Strongly emphasized in later versions:
> "Default to PARALLEL for all independent work. Call multiple tools simultaneously."

### 5. **Verification Gates**
Built-in quality checks:
- Read before edit
- Verify after changes
- Check for errors
- Test when applicable

---

## 📈 Evolution Highlights

### v1.0 → v1.2 (Major Changes):
1. Added memory system
2. Introduced agent mode
3. More concise communication
4. Better tool organization
5. Parallel execution emphasis

### v1.2 → Agent CLI 2025-08 (Refinements):
1. Terminal-specific optimizations
2. Even stricter conciseness
3. Structured tool usage patterns
4. Background process handling
5. CLI workflow awareness

### Key Trend:
📉 Verbose explanations → 📈 Terse, action-focused responses

---

## 🎯 Unique Patterns

### 1. **AGENTS.md Pattern**
Cursor pioneered per-project context files:
```markdown
AGENTS.md contains:
- Common commands (npm test, npm build)
- Code style preferences
- Project structure notes
- Custom instructions
```

### 2. **Memory Rating System**
Assigns importance scores (1-10) to memories:
- 1-3: Trivial (discard)
- 4-6: Moderate (keep briefly)
- 7-10: Important (persist)

### 3. **No Comments Philosophy**
Strong stance against code comments:
> "IMPORTANT: DO NOT ADD ANY COMMENTS unless asked."

---

## 🛠️ Tool Architecture

### Core Tools:
- **File Operations:** read_file, write_file, edit_file
- **Search:** grep_search, file_search, semantic_search
- **Execution:** run_in_terminal (with background mode)
- **Analysis:** get_errors, get_diagnostics
- **Memory:** memory_write, memory_read
- **Git:** Via terminal commands
- **Sub-agents:** Task delegation, search agents

### Tool Evolution:
- **v1.0:** ~10 basic tools
- **v1.2:** ~15 tools + sub-agents
- **2025:** 20+ tools + multi-agent orchestration

---

## 🔐 Security Features

Standard security in all versions:
- Never log secrets or API keys
- Validate file paths
- Warn before destructive operations
- Explain non-trivial bash commands
- Check for secrets before git commits

---

## 💡 Best Practices Extracted

### From Cursor Prompts:

1. **Be Concise:** Minimize token usage, respect user time
2. **Parallel by Default:** Independent operations run simultaneously
3. **Verify Changes:** Always check after editing
4. **No Comments:** AI explanations belong in chat, not code
5. **Use Memory:** Persist important context across sessions
6. **Read Before Edit:** Understand before modifying
7. **Fail Fast:** Stop after 3 failed attempts, ask user

---

## 📊 Comparison to Other Tools

### vs. GitHub Copilot:
- **Cursor:** Full IDE with multi-file editing, agent mode
- **Copilot:** Plugin for existing IDEs, inline completions

### vs. Windsurf:
- **Cursor:** More mature, larger user base
- **Windsurf:** Cascade architecture, newer patterns

### vs. Claude Code:
- **Cursor:** Visual IDE with GUI
- **Claude Code:** Terminal-focused, CLI tool

---

## 🎓 Learning Resources

### From Cursor Prompts:
- **Context Management:** AGENTS.md pattern for project-specific context
- **Memory Systems:** Importance-based persistence
- **Agent Architecture:** Coordination + delegation patterns
- **Tool Design:** Parallel-first, verification gates
- **Communication:** Concise, action-oriented

### Use Cases:
1. **Study conciseness evolution** (v1.0 → CLI 2025)
2. **Learn memory system design** (Memory Prompt.txt)
3. **Understand agent architectures** (Agent Prompt.txt)
4. **See tool orchestration** (Agent Tools v1.0.json)

---

## 🔄 Version Comparison

| Feature | v1.0 | v1.2 | CLI 2025 |
|---------|------|------|----------|
| Response Length | Moderate | Short | Very Short |
| Agent Mode | ❌ | ✅ | ✅ |
| Memory System | ❌ | ✅ | ✅ |
| Parallel Execution | Implicit | Explicit | Emphasized |
| Tool Count | ~10 | ~15 | ~20 |
| Sub-agents | ❌ | ✅ | ✅ |
| AGENTS.md Support | ❌ | ✅ | ✅ |

---

## 🎯 Key Takeaways

### What Makes Cursor Unique:
1. **AI-first IDE** (not just a plugin)
2. **Mature agent mode** with multi-agent orchestration
3. **Memory system** for context persistence
4. **Rapid iteration** visible through versions
5. **Strong emphasis on speed** (conciseness, parallel execution)

### Prompt Engineering Insights:
- Conciseness is a learned optimization (got stricter over time)
- Memory systems require importance scoring to scale
- Agent modes need clear delegation patterns
- Tool design matters: parallel-first architecture
- User feedback drives evolution (comments → no comments)

---

## 📅 Version History

| Version | Date | Major Changes |
|---------|------|---------------|
| v1.0 | July 2024 | Initial agent mode |
| v1.2 | August 2024 | Memory system, refinements |
| CLI 2025-08 | August 2025 | Terminal optimizations |
| 2025-09 | September 2025 | Latest iterations |

---

## 🔗 Related Tools

### Similar Architecture:
- **Windsurf** - Cascade architecture, similar multi-agent design
- **Amp** - Oracle + Executor separation
- **Claude Code** - Terminal-focused, concise prompts

### Complementary:
- **GitHub Copilot** - Can use alongside Cursor
- **Tabnine** - Alternative autocomplete

---

## 📚 Academic Interest

### Research Topics:
1. **Multi-agent coordination** in coding assistants
2. **Memory system design** for AI assistants
3. **Evolution of conciseness** in AI prompts (token economics)
4. **Tool architecture** for parallel execution
5. **Context management** strategies (AGENTS.md pattern)

### Relevant Papers:
- "Multi-Agent Systems for Code Generation" (cite if available)
- "Context Management in Large Language Models"
- "Tool Use in AI Assistants"

---

## 🤝 Community

- **Discord:** https://discord.gg/cursor
- **Forum:** https://forum.cursor.com
- **Twitter:** @cursor_ai
- **Documentation:** https://docs.cursor.com

---

## ⚖️ License

Cursor is proprietary software. These prompt files are documented for:
- Educational purposes
- Research
- Understanding AI assistant design
- Comparative analysis

**Source Attribution:** Cursor AI, Inc.  
**Documentation Purpose:** Fair use for education and research

---

## 🙏 Acknowledgments

- **Cursor Team** for building an innovative AI-first IDE
- **Community** for sharing insights and reverse-engineering efforts
- **Contributors** to this repository

---

*Last Updated: 2025-01-02*  
*Cursor Version: Latest as of September 2025*  
*README Version: 1.0*
