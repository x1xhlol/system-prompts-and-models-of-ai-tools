# 🔍 Common Patterns in AI Coding Tool Prompts

*Analysis of recurring patterns, instructions, and architectures across 31+ AI coding tools*

---

## 📊 Overview

After analyzing system prompts from Cursor, GitHub Copilot, Claude Code, Amp, Windsurf, and 26+ other tools, clear patterns emerge in how these systems are designed and instructed.

---

## 🎯 Core Instruction Patterns

### 1. **Role Definition**
Every tool starts by defining its identity and capabilities.

**Common Pattern:**
```
You are [NAME], a [TYPE] AI coding assistant.
You help the user with [PRIMARY TASKS].
Use the instructions below and the tools available to you to help the user.
```

**Examples:**
- **Cursor**: "You are a powerful agentic AI coding assistant, powered by Claude 3.7 Sonnet"
- **Amp**: "You are Amp, a powerful AI coding agent built by Sourcegraph"
- **Claude Code**: "You are an interactive CLI tool that helps users with software engineering tasks"

**Key Insight:** Strong identity = clearer behavior boundaries

---

### 2. **Tool Usage Instructions**
All tools follow similar patterns for tool interaction.

**Universal Rules:**
```markdown
1. ALWAYS follow the tool call schema exactly
2. NEVER refer to tool names when talking to users
3. Only call tools when necessary
4. Explain why you're calling a tool before calling it (optional)
5. Never call tools that are no longer available
```

**Example from Cursor:**
```
**NEVER refer to tool names when speaking to the USER.**
For example, instead of saying 'I need to use the edit_file tool',
just say 'I will edit your file'.
```

**Pattern Insight:** Tools are implementation details, not user-facing concepts

---

### 3. **Conciseness Mandate**
Almost every tool emphasizes brief, direct communication.

**Common Instructions:**
```markdown
- Be concise, direct, and to the point
- Answer in 1-3 sentences if possible
- Avoid unnecessary preamble or postamble
- No "The answer is..." or "Based on the information..."
- Skip explanations unless asked
```

**Examples:**
- **Claude Code**: "You MUST answer concisely with fewer than 4 lines"
- **Amp**: "Keep your responses short. You MUST answer concisely with fewer than 4 lines"
- **Cursor**: "IMPORTANT: Keep your responses short"

**Token Economics:** Shorter responses = lower costs + faster iteration

---

### 4. **Code Comment Restrictions**
Strong consensus against adding comments to code.

**Universal Pattern:**
```markdown
- IMPORTANT: DO NOT ADD ANY COMMENTS unless asked
- No explanatory comments in generated code
- Comments belong in text responses, not code
- Only add comments when:
  1. User explicitly requests them
  2. Code is complex and requires context
```

**Reasoning:** Code should be self-documenting; AI explanations go in chat

---

### 5. **Security Guardrails**
Every tool includes security-focused instructions.

**Common Security Rules:**
```markdown
1. Never introduce code that exposes or logs secrets/keys
2. Never commit secrets to repository
3. Follow security best practices
4. Never create malicious code
5. Redaction markers indicate removed secrets
```

**Example from Claude Code:**
```
IMPORTANT: Assist with defensive security tasks only.
Refuse to create, modify, or improve code that may be used maliciously.
```

**Pattern:** Defensive security is table stakes

---

## 🛠️ Tool Architecture Patterns

### 6. **Standard Tool Categories**
Almost identical tool sets across platforms.

**Core Tools (Present in 90%+ of tools):**
```
File Operations:
  - read_file / Read
  - edit_file / Edit
  - create_file / Write
  - delete_file

Search & Discovery:
  - codebase_search / semantic_search
  - grep_search / Grep
  - file_search / glob
  - list_directory

Execution:
  - run_terminal_cmd / Bash
  - run_command

Code Quality:
  - get_diagnostics
  - format_file

Web Access:
  - web_search
  - read_web_page

Version Control:
  - git commands (via terminal)
```

**Advanced Tools (Present in 50%+ of tools):**
```
- Sub-agents / Task executors
- Memory/Context management
- Image/multimodal support
- MCP (Model Context Protocol) support
```

---

### 7. **Sub-Agent Patterns**
Modern tools use specialized sub-agents.

**Common Sub-Agent Types:**

**A. Task Executors**
```
Purpose: Execute multi-step, complex tasks independently
Pattern: Fire-and-forget, no mid-execution communication
Examples: Cursor Agent, Amp Task, Claude Code Task
```

**B. Search Agents**
```
Purpose: Intelligent codebase exploration
Pattern: Combines grep, semantic search, file reading
Examples: Amp codebase_search_agent, Cursor codebase_search
```

**C. Reasoning Agents**
```
Purpose: Deep analysis, planning, architecture review
Pattern: Uses advanced models (o3, Claude Opus)
Examples: Amp Oracle, Cursor planning mode
```

**Implementation Pattern:**
```markdown
When to use sub-agents:
- Complex multi-step tasks
- High token cost operations
- Independent workstreams
- Specialized expertise needed

When NOT to use:
- Simple operations
- Need user interaction
- Uncertain requirements
```

---

### 8. **Context Management Patterns**

**Pattern 1: Explicit Context Files**
```
Tool: Claude Code, Amp
Method: AGENTS.md / AGENT.md files
Contains:
  - Common commands (test, build, lint)
  - Code style preferences
  - Project structure
  - Tool usage patterns
```

**Pattern 2: Memory Systems**
```
Tool: Cursor
Method: Explicit memory tool with ratings
Features:
  - Remember user preferences
  - Track project context
  - Rate memory importance
```

**Pattern 3: Workspace Caching**
```
Tool: Most tools
Method: Cache directory listings, file structures
Benefits:
  - Faster subsequent operations
  - Reduced API calls
```

**Pattern 4: Prompt Caching**
```
Tool: Claude-based tools
Method: Anthropic's prompt caching
Benefits:
  - Reuse system prompt tokens
  - Lower costs for long prompts
```

---

### 9. **Parallel Execution Patterns**
Modern tools emphasize concurrent operations.

**Standard Pattern:**
```markdown
Default to parallel for:
  - Independent file reads
  - Multiple searches
  - Separate code changes
  - Disjoint sub-agent tasks

Serialize only when:
  - Dependency exists
  - Same file editing
  - Shared contract changes
```

**Example from Amp:**
```
Default to **parallel** for all independent work:
reads, searches, diagnostics, writes and **subagents**.
Serialize only when there is a strict dependency.
```

**Performance Impact:** 3-10x faster for multi-step operations

---

### 10. **Verification Gate Pattern**
Consistent quality check workflows.

**Standard Verification Order:**
```
1. Typecheck (TypeScript, etc.)
2. Lint (ESLint, etc.)
3. Tests (Jest, pytest, etc.)
4. Build (compile, bundle)
```

**Implementation Pattern:**
```markdown
After code changes:
1. Run diagnostics tool
2. Execute typecheck command
3. Execute lint command
4. Run test suite
5. Report results concisely
```

**Source of Truth:** AGENTS.md or similar context file

---

## 📝 Communication Patterns

### 11. **File Linking Convention**
Universal pattern for referencing code.

**Standard Format:**
```markdown
file:///absolute/path/to/file.ext#L42
file:///absolute/path/to/file.ext#L32-L45
```

**Usage Pattern:**
```markdown
- Use fluent linking (embedded in text)
- Always link when mentioning files
- URL-encode special characters
- Include line numbers when specific
```

**Example:**
```markdown
The [`extractAPIToken` function](file:///Users/bob/auth.js#L158)
validates request headers.
```

---

### 12. **Markdown Formatting Rules**
Strict, consistent markdown across tools.

**Universal Rules:**
```markdown
- Bullets: Use hyphens `-` only
- Numbered lists: Only for procedural steps
- Headings: Don't skip levels (#, ##, ###)
- Code fences: Always add language tag
- Inline code: Use backticks
- Links: file:// for local, https:// for web
- No emojis (unless user requests)
- Minimal exclamation points
```

**Reasoning:** Consistent, parseable output

---

### 13. **Example-Driven Instructions**
Most effective teaching method in prompts.

**Pattern:**
```markdown
<example>
user: [user query]
assistant: [correct behavior with tool calls]
</example>

<bad-example>
[What NOT to do]
</bad-example>
```

**Why It Works:**
- Shows, doesn't just tell
- Handles edge cases
- Clarifies ambiguous instructions
- Faster model learning

**Observation:** Tools with more examples = better behavior

---

## 🎯 Task Management Patterns

### 14. **TODO List Pattern**
Newer tools emphasize visible progress tracking.

**Standard Implementation:**
```markdown
Tools: todo_write, todo_read

When to use:
- Complex multi-step tasks
- Breaking down ambiguous requests
- Giving user visibility

Best practices:
- Create at task start
- Mark in-progress before starting
- Mark completed immediately after finishing
- Don't batch completions
```

**Example from Claude Code:**
```markdown
Examples:
user: Run the build and fix any type errors
assistant:
[uses todo_write]
- [ ] Run the build
- [ ] Fix any type errors

[runs build, finds 10 errors]
[todo_write: adds 10 error items]
[marks first as in_progress]
[fixes it]
[marks as completed]
[continues...]
```

**UI Impact:** Makes AI work feel more transparent and controllable

---

### 15. **Planning Before Action Pattern**
Distinguish between planning and execution.

**Pattern:**
```markdown
If user asks HOW to do something:
  → Explain, don't execute

If user asks you TO DO something:
  → Execute directly

For large tasks:
  → Show brief plan first
  → Wait for approval
  → Then execute
```

**Example:**
```
Bad:
user: "How should I approach authentication?"
assistant: [immediately edits files]

Good:
user: "How should I approach authentication?"
assistant: "Here's the approach: 1... 2... 3..."

user: "Implement user authentication"
assistant: [creates todo list, starts implementing]
```

---

## 🔄 Code Editing Patterns

### 16. **Edit vs Create Pattern**
Clear distinction in file operations.

**Create File When:**
```
- New file doesn't exist
- Want to replace entire file
- More token-efficient than edit
```

**Edit File When:**
```
- Modifying existing code
- Targeted changes
- Preserving surrounding context
```

**Implementation Pattern:**
```markdown
edit_file requires:
  - old_str: Exact text to replace (with context)
  - new_str: Exact replacement text
  - Must be unique match (or use replace_all)
```

**Anti-pattern:** Reading entire file to change one line

---

### 17. **Context Before Edit Pattern**
Universal requirement to understand before changing.

**Standard Pattern:**
```markdown
Before editing:
1. Read the file/section to edit
2. Understand surrounding code
3. Check imports and dependencies
4. Match existing style
5. Then make the change
```

**Example from Cursor:**
```
Unless you are appending some small easy to apply edit,
or creating a new file, you MUST read the contents or
section of what you're editing before editing it.
```

---

### 18. **Existing Patterns Pattern**
Reuse over invention.

**Universal Instruction:**
```markdown
Before creating new code:
1. Search for similar patterns
2. Check existing libraries
3. Mirror naming conventions
4. Follow established style
5. Reuse interfaces/schemas
```

**From Amp:**
```markdown
- **Reuse-first**: search for existing patterns;
  mirror naming, error handling, I/O, typing, tests.
- When you create a new component, first look at
  existing components to see how they're written
```

**Anti-pattern:** Introducing new patterns not used elsewhere

---

## 🔐 Advanced Patterns

### 19. **Multi-Model Strategy**
Tools increasingly support multiple models.

**Common Pattern:**
```markdown
Available models:
- Fast models: For tab completion, simple queries
- Balanced models: For chat, medium tasks
- Powerful models: For complex reasoning

Model selection by:
- Task complexity
- Required capabilities
- User preference
- Cost optimization
```

**Examples:**
- **Copilot**: GPT-4.1, GPT-5, GPT-5-mini, Claude-4, Gemini 2.5
- **Cursor**: GPT-4, GPT-5, Claude 3.5, Claude 4
- **Cline**: Any OpenAI/Anthropic/Google model

---

### 20. **Error Handling Pattern**
Consistent approach to failures.

**Standard Pattern:**
```markdown
When errors occur:
1. Don't loop >3 times on same error
2. Try alternative approach
3. If stuck, ask user
4. Don't suppress errors unless explicitly told
5. Report error context concisely
```

**Linter Error Pattern:**
```markdown
If you've introduced linter errors:
1. Fix if clear how to
2. Don't make uneducated guesses
3. Stop after 3 attempts
4. Ask user for direction
```

---

### 21. **Git Workflow Pattern**
Standardized git integration.

**Common Commands:**
```bash
1. git status  # See changes
2. git diff    # See modifications
3. git log     # See history
4. git add     # Stage files
5. git commit  # Commit with message
```

**Commit Message Pattern:**
```markdown
Format:
[Brief description]

🤖 Generated with [Tool Name](url)
Co-Authored-By: AI <email>
```

**Best Practices:**
```markdown
- Never use interactive git commands (-i flag)
- Always check status first
- Verify staging before commit
- Follow repo's commit style
- Never update git config
- Don't push unless explicitly asked
```

---

### 22. **Web Search Pattern**
When and how to use web access.

**When to Search Web:**
```markdown
- User provides URL to read
- Need current information
- Looking for documentation
- Researching libraries
- Finding best practices
```

**When NOT to Search:**
```markdown
- Information in existing knowledge
- Internal codebase questions
- When you have context already
```

**Tool-Specific URLs:**
```markdown
Claude Code: Fetch from docs.anthropic.com/en/docs/claude-code
Amp: Fetch from ampcode.com/manual
Cursor: Check cursor.sh documentation
```

---

### 23. **Background Process Pattern**
Handling long-running commands.

**Pattern:**
```markdown
Background processes for:
- Servers (dev, prod)
- Watch modes
- Long builds

Implementation:
- Set is_background: true
- Or use run_in_background parameter
- Never use & operator directly
- Return terminal ID for monitoring
```

**Example:**
```json
{
  "command": "npm run dev",
  "is_background": true
}
```

---

## 📊 Emerging Patterns

### 24. **Reasoning Model Integration**
New pattern with o1/o3 models.

**Pattern (Amp Oracle):**
```markdown
Oracle Tool:
- Uses OpenAI o3 reasoning model
- For planning, debugging, architecture
- Has access to: Read, Grep, Web
- Returns detailed analysis

When to use:
- Code reviews
- Complex debugging
- Architecture planning
- Deep analysis
```

**Trend:** Separate "thinking" models from "doing" models

---

### 25. **MCP (Model Context Protocol) Pattern**
Emerging standard for tool integration.

**Pattern:**
```markdown
read_mcp_resource:
  server: "filesystem-server"
  uri: "file:///path/to/file"

Benefits:
- Standardized tool interface
- Third-party integrations
- Extensibility
```

**Adoption:** Early but growing

---

### 26. **Workspace State Caching**
Performance optimization pattern.

**Pattern:**
```markdown
Cache:
- Directory listings
- File structure
- Recent files
- Common reads

Update on:
- File changes
- User navigation
- Explicit refresh
```

**Impact:** 50-80% faster context gathering

---

## 🎓 Best Practice Synthesis

### Universal Best Practices Found Across All Tools:

1. **✅ Be Concise** - Every tool emphasizes this
2. **✅ Security First** - Never log secrets
3. **✅ Verify Changes** - Run checks after edits
4. **✅ Understand Before Changing** - Read first
5. **✅ Follow Existing Patterns** - Reuse over invent
6. **✅ Use Parallel Execution** - When possible
7. **✅ Link to Files** - Always use file:// URLs
8. **✅ No Code Comments** - Unless asked
9. **✅ Respect Context Limits** - Be strategic
10. **✅ Plan Complex Tasks** - Use TODO lists

---

## 🔍 Anti-Patterns to Avoid

Common mistakes explicitly called out:

1. ❌ Verbose responses
2. ❌ Unnecessary tool use
3. ❌ Serial when should be parallel
4. ❌ Reading entire file for small edit
5. ❌ Adding comments without request
6. ❌ Suppressing linter errors
7. ❌ Ignoring existing patterns
8. ❌ Not verifying changes
9. ❌ Looping on same error >3x
10. ❌ Mentioning tool names to users

---

## 📈 Evolution Trends

Comparing older vs newer prompts:

**Older Patterns (2023-early 2024):**
- Simpler tool sets
- More verbose
- Less parallel execution
- Fewer sub-agents

**Newer Patterns (late 2024-2025):**
- Sub-agent architecture
- Strict conciseness
- Parallel by default
- Reasoning model integration
- TODO/progress tracking
- AGENTS.md pattern
- MCP support

---

## 💡 Key Insights

1. **Convergent Evolution**: Tools independently arrived at similar patterns
2. **Token Economics Matter**: Conciseness is cost-driven
3. **User Experience Focus**: Transparency (TODOs) improves trust
4. **Security is Universal**: Every tool includes guardrails
5. **Modularity Wins**: Sub-agents are the future
6. **Context is King**: All tools struggle with context limits
7. **Verification is Essential**: Every tool checks its work

---

*This analysis is based on actual system prompts from 31+ tools in this repository.*

**Last Updated:** October 2, 2025
