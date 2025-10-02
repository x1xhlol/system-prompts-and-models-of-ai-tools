# Claude Code

**Type:** CLI Tool (Terminal-based AI Assistant)  
**Availability:** Free with Claude API access  
**Provider:** Anthropic  
**Model:** Claude 3.5 Sonnet, Claude 4 (latest)

---

## 📋 Overview

Claude Code is Anthropic's official terminal-based AI coding assistant. Features:
- Autonomous terminal agent
- Full file system access
- Bash command execution
- Multi-file editing
- Web search integration
- TODO/progress tracking
- AGENTS.md support
- Git workflow integration

**Philosophy:** Concise, action-oriented, autonomous

---

## 📂 Files in This Directory

### System Prompts:
- **`claude-code-system-prompt.txt`** - Complete system instructions

### Tools:
- **`claude-code-tools.json`** - Comprehensive tool definitions (20+ tools)

---

## 🔍 Source

- **Provider:** Anthropic
- **Official Documentation:** Part of Claude API
- **Date Captured:** October 2024 (latest update)
- **Attribution:** Anthropic PBC

---

## 🎯 Key Features

### 1. **Extreme Conciseness**
One of the most concise prompts analyzed:
> "Be concise. Answer in 1-3 sentences. No preamble or postamble. After editing, just stop."

### 2. **TODO System**
Built-in progress tracking:
```markdown
Tools: todo_write, todo_read

Workflow:
1. Plan: Create TODO list
2. Execute: Mark items in-progress
3. Complete: Mark done immediately
4. Report: User sees progress
```

### 3. **AGENTS.md Pattern**
Per-project context file:
```markdown
AGENTS.md contains:
- Commands (npm test, npm run dev)
- Style preferences
- Project notes
- Custom instructions
```

### 4. **Git Workflow**
Structured commit process:
1. Check status + diff in parallel
2. Analyze changes + check for secrets
3. Stage files
4. Commit with formatted message
5. Include attribution footer

### 5. **Defensive Security Only**
Strong security stance:
> "IMPORTANT: Assist with defensive security tasks only. Refuse to create, modify, or improve code that may be used maliciously."

---

## 🛠️ Tool Architecture

### Core Tools (20+):

**File Operations:**
- read_file, write_to_file, search_replace
- list_dir, glob (pattern matching)

**Search:**
- grep_search, semantic_search
- read_web_page (web search integration)

**Execution:**
- run_bash_command (with background mode)

**Progress:**
- todo_write, todo_read

**Analysis:**
- get_linting_diagnostics

**Git:**
- Via bash with structured workflow

### Tool Design Principles:
1. **Minimal tool count** (20 vs. 30+ in some tools)
2. **Clear separation** of concerns
3. **Composable** (tools combine well)
4. **Parallel-friendly** (independent operations)

---

## 📊 Unique Patterns

### 1. **No Explanatory Comments**
Explicit instruction:
> "IMPORTANT: DO NOT ADD ANY COMMENTS unless asked. Only add comments when: 1. User explicitly requests them, 2. Code is complex and requires context"

**Rationale:** AI can explain in chat, comments clutter code.

### 2. **Verify Before Committing**
Required checks:
- Analyze all staged changes
- Draft commit message
- Check for sensitive information
- Include co-author attribution

### 3. **Parallel Execution Default**
> "Whenever possible, you should call the functions in parallel. If there is no strict dependency, you should call them in parallel."

**Performance Impact:** 3-10x faster task completion

### 4. **Context from Multiple Sources**
Intelligent context gathering:
1. Direct file content
2. Diagnostics/errors
3. AGENTS.md (if exists)
4. Web search (when needed)
5. Codebase semantic search

---

## 🔐 Security Features

### Comprehensive Security Instructions:

1. **Never Log Secrets:**
   > "Never introduce code that exposes or logs secrets and keys. Never commit secrets or keys to the repository."

2. **Defensive Security Only:**
   - Security analysis: ✅ Allowed
   - Vulnerability explanations: ✅ Allowed
   - Exploit creation: ❌ Forbidden
   - Malicious code: ❌ Forbidden

3. **Git Security:**
   - Check for secrets before staging
   - Review all changes before commit
   - No force push without explicit permission

4. **Bash Command Safety:**
   > "When you run a non-trivial bash command, you should explain what the command does and why you are running it."

---

## 💡 Best Practices Extracted

### From Claude Code Prompts:

1. **Conciseness is King:**
   - 1-3 sentence responses
   - No preamble or postamble
   - Stop immediately after task completion

2. **TODO Transparency:**
   - Create plan before starting
   - Mark in-progress before work
   - Complete immediately after finishing
   - Give user visibility

3. **Parallel by Default:**
   - Independent operations run simultaneously
   - Serialize only when necessary
   - 3-10x performance improvement

4. **No Code Comments:**
   - Explain in chat, not in code
   - Only add when explicitly requested
   - Keep code clean

5. **Read Before Edit:**
   - Always read file first
   - Understand context
   - Make informed changes

6. **Verify Changes:**
   - Check after editing
   - Run tests when applicable
   - Ensure success

7. **Fail Fast:**
   - If same error persists, stop after 3 attempts
   - Ask user for guidance
   - Don't loop indefinitely

---

## 🎯 Comparison to Other Tools

### vs. Cursor:
- **Claude Code:** Terminal-first, CLI tool
- **Cursor:** Visual IDE, GUI-focused

### vs. GitHub Copilot:
- **Claude Code:** Autonomous agent, multi-file
- **Copilot:** Inline completions, autocomplete

### vs. Windsurf:
- **Claude Code:** More mature, simpler architecture
- **Windsurf:** Cascade architecture, newer patterns

### vs. Devin:
- **Claude Code:** Developer tool, terminal-based
- **Devin:** Autonomous developer, full project ownership

---

## 📈 Evolution & Updates

### Observable Changes:
- October 2024: Latest captured version
- Increased emphasis on conciseness
- TODO system maturity
- Git workflow refinement
- Security instructions expanded

### Future Directions:
- Likely continued conciseness optimization
- More tool additions
- Better context management
- Enhanced parallel execution

---

## 🎓 Learning Resources

### From Claude Code:

**Prompt Engineering:**
- How to achieve extreme conciseness
- Tool architecture for parallel execution
- Security instruction design
- TODO/progress tracking patterns

**Software Engineering:**
- Git workflow best practices
- Code review patterns
- Testing strategies
- Security-first development

**AI Design:**
- Multi-tool orchestration
- Context management
- Error handling
- User communication

---

## 📊 Key Statistics

| Metric | Value |
|--------|-------|
| Total Tools | 20+ |
| Prompt Length | ~15,000 tokens |
| Response Target | 1-3 sentences |
| Parallel Execution | Default |
| Security Rules | 10+ explicit |
| Git Commands | Structured workflow |

---

## 🔍 Technical Deep Dive

### Tool Definitions (`claude-code-tools.json`):

**Example: read_file**
```json
{
  "name": "read_file",
  "description": "Read the contents of a file",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "The absolute path to the file"
      }
    },
    "required": ["path"]
  }
}
```

**Design Principles:**
- Clear descriptions
- Explicit parameter types
- Required vs. optional fields
- Absolute paths (no ambiguity)

---

## 🎯 Use Cases

### Ideal For:
1. **Terminal-based workflows** (developers who live in CLI)
2. **Multi-file refactoring** (autonomous agent handles complexity)
3. **Git-heavy workflows** (structured commit process)
4. **Security-sensitive projects** (defensive security only)
5. **Quick iterations** (extreme conciseness = fast responses)

### Not Ideal For:
1. Visual debugging (no GUI)
2. Beginners (terminal-focused)
3. Windows users (bash-centric, though adaptable)

---

## 🌍 Impact & Influence

### Claude Code's Influence on Other Tools:

1. **TODO System:**
   - Adopted by Amp, Windsurf
   - Now a standard pattern

2. **AGENTS.md:**
   - Spreading across tools
   - Becoming de facto standard

3. **Conciseness Mandate:**
   - Influenced Cursor, others
   - Token economics driving design

4. **No Comments Philosophy:**
   - Controversial but spreading
   - AI explanations > code comments

5. **Parallel Execution:**
   - Performance insight
   - Now emphasized in many tools

---

## 📚 Academic Interest

### Research Topics:

1. **Conciseness in AI Assistants:**
   - Impact on user experience
   - Token cost savings
   - Information density

2. **Multi-Tool Orchestration:**
   - Parallel vs. serial execution
   - Performance benchmarks
   - Tool dependency graphs

3. **Security in AI Assistants:**
   - Defensive security only approach
   - Secret detection patterns
   - Malicious use prevention

4. **Context Management:**
   - AGENTS.md pattern effectiveness
   - Long-term memory vs. per-project context
   - Optimal context size

---

## 🔗 Related Resources

- **Anthropic Documentation:** https://docs.anthropic.com
- **Claude API:** https://console.anthropic.com
- **Community:** https://discord.gg/anthropic
- **Research Papers:** Anthropic publications on AI safety

---

## 🤝 Contributing

Found updates or improvements? See [CONTRIBUTING.md](../CONTRIBUTING.md)

**To Add:**
- Newer versions of prompts
- Tool definition updates
- Usage examples
- Comparative analysis

---

## ⚖️ License & Attribution

**Provider:** Anthropic PBC  
**Documentation Purpose:** Educational and research  
**Usage:** These prompts are documented under fair use for:
- Understanding AI assistant design
- Comparative analysis
- Educational purposes
- Research

**Source Attribution:** Anthropic Claude Code

---

## 🙏 Acknowledgments

- **Anthropic Team** for Claude and Claude Code
- **Community** for sharing insights
- **Contributors** to this repository

---

## 📞 Contact

For questions about Claude Code specifically:
- **Anthropic Support:** support@anthropic.com
- **Documentation:** https://docs.anthropic.com

For this repository:
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions

---

*Last Updated: 2025-01-02*  
*Claude Code Version: October 2024*  
*README Version: 1.0*
