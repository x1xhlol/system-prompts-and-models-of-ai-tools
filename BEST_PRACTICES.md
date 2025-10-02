# 🎯 Best Practices Extracted from AI Coding Tools

*Curated best practices learned from analyzing 31+ production AI coding assistants*

---

## 📚 Table of Contents

1. [Code Generation](#code-generation)
2. [Tool Usage](#tool-usage)
3. [Communication](#communication)
4. [Context Management](#context-management)
5. [Code Quality](#code-quality)
6. [Security](#security)
7. [Performance](#performance)
8. [User Experience](#user-experience)

---

## 💻 Code Generation

### ✅ DO: Understand Before Modifying

**Practice:**
```markdown
Before editing any code:
1. Read the file or relevant section
2. Understand imports and dependencies
3. Check surrounding context
4. Identify existing patterns
5. Match the code style
```

**Why:** Prevents introducing bugs, style inconsistencies, or breaking changes.

**Example from Claude Code:**
> "Unless you are appending some small easy to apply edit, or creating a new file, you MUST read the contents or section of what you're editing before editing it."

---

### ✅ DO: Reuse Existing Patterns

**Practice:**
```markdown
When creating new code:
1. Search for similar existing patterns
2. Mirror naming conventions
3. Follow established error handling
4. Use existing libraries/utilities
5. Match typing patterns
```

**Why:** Maintains consistency, reduces cognitive load, leverages battle-tested code.

**Example from Amp:**
> "Reuse-first: search for existing patterns; mirror naming, error handling, I/O, typing, tests."

---

### ✅ DO: Minimize Code Comments

**Practice:**
```markdown
Add comments ONLY when:
- User explicitly requests them
- Code is genuinely complex and requires context
- NOT for explaining obvious operations
```

**Why:** Code should be self-documenting; AI explanations belong in chat, not code.

**Universal Across Tools:**
> "IMPORTANT: DO NOT ADD ANY COMMENTS unless asked"

---

### ✅ DO: Create Small, Focused Changes

**Practice:**
```markdown
Prefer:
- Single-file changes when possible
- Smallest diff that solves the problem
- Local fixes over cross-file refactors
- Cohesive, logical changesets
```

**Why:** Easier to review, test, and debug.

**Example from Amp:**
> "Simple-first: prefer the smallest, local fix over a cross-file architecture change."

---

### ✅ DO: Strong Typing

**Practice:**
```markdown
Always:
- Use explicit types (TypeScript, Python type hints, etc.)
- Define interfaces/contracts
- Avoid 'any' types
- Document type expectations
```

**Why:** Catches errors early, improves IDE support, makes code self-documenting.

---

### ❌ DON'T: Suppress Errors Without Reason

**Practice:**
```markdown
Avoid:
- `as any` in TypeScript
- `@ts-expect-error` comments
- Linter suppressions (// eslint-disable)
- Try-catch with empty handlers

Unless: User explicitly requests it
```

**Why:** Hidden errors become production bugs.

---

## 🛠️ Tool Usage

### ✅ DO: Use Parallel Execution

**Practice:**
```markdown
Call tools in parallel when:
- Operations are independent
- Reading multiple files
- Performing multiple searches
- Running disjoint tasks

Serialize only when:
- Operations have dependencies
- Editing the same file
- Shared state mutations
```

**Why:** 3-10x faster execution.

**Example from Amp:**
> "Default to parallel for all independent work: reads, searches, diagnostics, writes and subagents."

---

### ✅ DO: Be Strategic About Context

**Practice:**
```markdown
Context gathering:
1. Start broad, then narrow
2. Fan out searches in parallel
3. Stop as soon as you can act
4. Don't repeat queries
5. Cache results when possible
```

**Why:** Reduces latency, API costs, token usage.

**Example from Amp:**
> "Early stop: act if you can name exact files/symbols to change or have a high-confidence bug locus."

---

### ✅ DO: Choose the Right Tool

**Practice:**
```markdown
- Semantic search: For concepts, "where is X handled?"
- Grep: For exact strings, function names
- Glob: For file patterns
- List directory: For discovery
- Read: For specific known files
```

**Why:** Each tool is optimized for different use cases.

---

### ❌ DON'T: Over-Use Tools

**Practice:**
```markdown
Don't call tools when:
- You already have the information
- Answer is in existing context
- User asks about your capabilities
- Simple question with known answer
```

**Why:** Wastes time, tokens, and costs.

---

## 💬 Communication

### ✅ DO: Be Concise

**Practice:**
```markdown
Responses should be:
- Direct and to the point
- 1-3 sentences when possible
- Without unnecessary preamble
- Without unnecessary postamble
- One-word answers when appropriate
```

**Why:** Faster interaction, lower costs, better UX.

**Universal Standard:**
> "You MUST answer concisely with fewer than 4 lines unless user asks for detail."

---

### ✅ DO: Link to Code

**Practice:**
```markdown
When mentioning files:
- Always use file:// URLs
- Include line numbers: #L42 or #L32-L45
- Use fluent linking style
- URL-encode special characters

Format: file:///absolute/path/to/file.ext#L42-L45
```

**Why:** Makes navigation instant and precise.

**Example:**
> "The [`extractAPIToken` function](file:///Users/bob/auth.js#L158) validates headers."

---

### ✅ DO: Use Consistent Markdown

**Practice:**
```markdown
- Bullets: Use `-` only
- Numbers: Only for sequential steps
- Headings: # ## ### (don't skip levels)
- Code blocks: Always add language tag
- No emojis unless requested
```

**Why:** Consistent, parseable, professional output.

---

### ❌ DON'T: Explain Unless Asked

**Practice:**
```markdown
After making changes:
- Don't summarize what you did
- Don't explain your reasoning
- Don't add postamble
- Just stop

Unless: User asks for explanation
```

**Why:** User can see the diff; explanation is noise.

---

### ❌ DON'T: Mention Tool Names

**Practice:**
```markdown
Bad:  "I'll use the edit_file tool to make changes"
Good: "I'll edit the file"

Bad:  "Let me use the Grep tool to search"
Good: "Let me search for that"
```

**Why:** Tools are implementation details, not user-facing concepts.

---

## 🧠 Context Management

### ✅ DO: Use Context Files

**Practice:**
```markdown
Create AGENTS.md or AGENT.md with:
- Common commands (test, build, lint)
- Code style preferences
- Project structure notes
- Tool-specific instructions
- Frequently used patterns
```

**Why:** Persistent context across sessions, reduces repetition.

**Tools Using This:** Claude Code, Amp, emerging standard

---

### ✅ DO: Track TODOs Visibly

**Practice:**
```markdown
For multi-step tasks:
1. Create TODO list at start
2. Mark in-progress before starting
3. Complete immediately after finishing
4. Don't batch completions
```

**Why:** Gives users visibility and control.

**Example:**
```markdown
[ ] Analyze bug
[→] Fix authentication 
[✓] Update tests
[ ] Verify build
```

---

### ✅ DO: Respect Context Limits

**Practice:**
```markdown
Be strategic:
- Read targeted sections, not entire files
- Use line ranges efficiently
- Cache frequently used info
- Summarize when appropriate
- Don't repeat context unnecessarily
```

**Why:** Even 200K token windows can fill up.

---

## 🎯 Code Quality

### ✅ DO: Verify Your Changes

**Practice:**
```markdown
Standard verification order:
1. get_diagnostics (check for errors)
2. Run typecheck (tsc, mypy, etc.)
3. Run linter (eslint, flake8, etc.)
4. Run tests
5. Run build

After EVERY code change.
```

**Why:** Catch issues immediately, don't leave broken code.

**Universal Pattern:**
> "After completing a task, you MUST run diagnostics and any lint/typecheck commands."

---

### ✅ DO: Follow Project Conventions

**Practice:**
```markdown
Check and match:
- Indentation (tabs vs spaces)
- Quote style (single vs double)
- Naming patterns (camelCase vs snake_case)
- Import organization
- Error handling patterns
- Logging patterns
```

**Why:** Consistency = maintainability.

---

### ✅ DO: Write Tests

**Practice:**
```markdown
When adding features:
1. Check if tests exist nearby
2. Follow existing test patterns
3. Add minimal coverage
4. Run tests to verify
```

**Why:** Prevents regressions, documents behavior.

---

### ❌ DON'T: Introduce New Dependencies Lightly

**Practice:**
```markdown
Before adding a new library:
1. Check if it already exists in project
2. Look for existing alternatives
3. Consider if built-in solution exists
4. Ask user for approval
```

**Why:** Dependencies = maintenance burden + security risk.

---

## 🔒 Security

### ✅ DO: Never Log Secrets

**Practice:**
```markdown
NEVER:
- Log API keys
- Print passwords
- Console.log tokens
- Expose secrets in errors
- Commit secrets to git
```

**Why:** Security breach waiting to happen.

**Universal Rule:**
> "Never introduce code that exposes or logs secrets and keys."

---

### ✅ DO: Follow Security Best Practices

**Practice:**
```markdown
Always:
- Validate user input
- Sanitize data before queries
- Use parameterized queries
- Implement proper authentication
- Follow principle of least privilege
```

**Why:** Security by default, not as an afterthought.

---

### ✅ DO: Handle Redaction Markers

**Practice:**
```markdown
If you see [REDACTED:token-name]:
- Recognize it as a removed secret
- Don't overwrite with the marker
- Original file still has the secret
- Don't include in edits
```

**Why:** Prevents accidentally removing real secrets.

---

### ❌ DON'T: Create Malicious Code

**Practice:**
```markdown
Refuse to:
- Create exploits
- Bypass security
- Generate malware
- Exfiltrate data

Allow:
- Defensive security
- Vulnerability analysis
- Security documentation
```

**Why:** Ethical responsibility.

---

## ⚡ Performance

### ✅ DO: Parallelize Independent Operations

**Practice:**
```markdown
Run in parallel:
- Reading multiple files
- Multiple search operations
- Independent diagnostics
- Separate sub-agent tasks
```

**Why:** Dramatically faster execution.

---

### ✅ DO: Use Sub-Agents Strategically

**Practice:**
```markdown
Use sub-agents for:
- Multi-step complex tasks
- High-token operations
- Independent workstreams
- Specialized analysis

Don't use for:
- Simple operations
- Uncertain requirements
- Need user interaction
```

**Why:** Offload work, reduce main context usage.

---

### ✅ DO: Cache Intelligently

**Practice:**
```markdown
Cache:
- Directory structures
- Frequently read files
- Search results
- Workspace state

Invalidate on:
- File changes
- Explicit user refresh
```

**Why:** 50-80% faster subsequent operations.

---

## 👤 User Experience

### ✅ DO: Show Your Progress

**Practice:**
```markdown
For long tasks:
- Create visible TODO list
- Update as you progress
- Mark items complete immediately
- Give user visibility
```

**Why:** Reduces anxiety, builds trust, allows intervention.

---

### ✅ DO: Explain Non-Obvious Actions

**Practice:**
```markdown
Before running:
- Complex terminal commands
- Potentially destructive operations
- Large-scale changes

Explain:
- What the command does
- Why you're running it
- Expected outcome
```

**Why:** User trust and safety.

---

### ✅ DO: Ask When Uncertain

**Practice:**
```markdown
Ask user when:
- Multiple valid approaches exist
- Decision is subjective
- Requirements are ambiguous
- Risk of breaking things

Provide:
- 2-3 options
- Recommendation
- Trade-offs
```

**Why:** Collaboration over guessing.

---

### ❌ DON'T: Loop on Failures

**Practice:**
```markdown
If same error persists:
- Stop after 3 attempts
- Try different approach, or
- Ask user for guidance
- Don't keep repeating
```

**Why:** Infinite loops waste resources and frustrate users.

---

## 🔄 Git Best Practices

### ✅ DO: Understand Before Committing

**Practice:**
```markdown
Before git commit:
1. Run git status (see all changes)
2. Run git diff (see modifications)
3. Check staged vs unstaged
4. Review for secrets
5. Write meaningful commit message
```

**Why:** Commit quality reflects code quality.

---

### ✅ DO: Write Good Commit Messages

**Practice:**
```markdown
Format:
[Brief description of what and why]

🤖 Generated with [Tool](url)
Co-Authored-By: AI <email>
```

**Why:** Future maintainers (including you) will thank you.

---

### ❌ DON'T: Push Without Permission

**Practice:**
```markdown
git push only when:
- User explicitly asks
- Part of approved workflow
- Never automatically
```

**Why:** Respect user's control over remote state.

---

## 📊 Verification Best Practices

### ✅ DO: Run Diagnostics First

**Practice:**
```markdown
After any code change:
1. get_diagnostics tool
2. Review errors/warnings
3. Fix critical issues
4. Proceed to other checks
```

**Why:** Catch syntax/type errors immediately.

---

### ✅ DO: Follow Verification Order

**Practice:**
```markdown
Standard order:
1. Diagnostics (fast)
2. Typecheck (medium)
3. Lint (fast)
4. Tests (slow)
5. Build (slowest)

Stop at first failure, fix, retry.
```

**Why:** Fail fast, save time.

---

## 🎓 Learning from Errors

### ✅ DO: Learn from Linter Errors

**Practice:**
```markdown
When linter fails:
1. Read error message carefully
2. Fix if clear how to
3. Don't guess wildly
4. Stop after 3 attempts
5. Ask user if stuck
```

**Why:** Thoughtful fixes > trial and error.

---

### ✅ DO: Use Error Context

**Practice:**
```markdown
Include in error analysis:
- Full error message
- Stack trace
- File/line numbers
- Recent changes
- Related code
```

**Why:** Better diagnosis, faster fix.

---

## 🌟 Advanced Best Practices

### ✅ DO: Use Reasoning Models for Complex Tasks

**Practice:**
```markdown
Use advanced reasoning (o3, Opus) for:
- Architecture planning
- Complex debugging
- Code reviews
- Trade-off analysis

Don't use for:
- Simple operations
- Known solutions
- Routine tasks
```

**Why:** Right tool for the job.

---

### ✅ DO: Design with Modularity

**Practice:**
```markdown
Break code into:
- Small, focused functions
- Clear interfaces
- Reusable components
- Testable units
```

**Why:** Easier to understand, test, and maintain.

---

### ✅ DO: Handle Edge Cases

**Practice:**
```markdown
Consider:
- Empty inputs
- Null/undefined
- Boundary values
- Error conditions
- Network failures
```

**Why:** Robust code handles reality.

---

## 📝 Documentation Best Practices

### ✅ DO: Document Decisions

**Practice:**
```markdown
For non-obvious choices, document:
- Why this approach?
- What alternatives considered?
- What are the trade-offs?

Location: Comments (when asked) or README
```

**Why:** Future developers understand context.

---

### ❌ DON'T: Write README in Code

**Practice:**
```markdown
Bad:  Verbose code comments explaining everything
Good: Self-documenting code + README for overview
```

**Why:** Code says "how", docs say "why".

---

## 🎯 Summary: Universal Rules

The following appear in nearly EVERY tool's instructions:

1. ✅ **Be concise** - Under 4 lines when possible
2. ✅ **Security first** - Never log secrets
3. ✅ **Verify changes** - Run checks after every edit
4. ✅ **Understand first** - Read before editing
5. ✅ **Follow patterns** - Reuse over invent
6. ✅ **Parallel execution** - When independent
7. ✅ **Link to files** - Always use file:// URLs
8. ✅ **Minimal comments** - Only when asked
9. ✅ **Respect limits** - Be strategic with context
10. ✅ **Show progress** - Use TODO lists for complex work

---

## 🚀 Next-Level Practices

For advanced users:

1. **Master sub-agents** - Delegate effectively
2. **Optimize context** - Use AGENTS.md pattern
3. **Parallel everything** - Default mindset
4. **Cache aggressively** - But invalidate correctly
5. **Specialize models** - Fast for simple, powerful for complex
6. **Automate verification** - Make it part of workflow
7. **Contribute patterns** - Update AGENTS.md as you learn

---

*These practices are distilled from analyzing 31+ production AI coding tools. They represent thousands of hours of engineering effort and real-world usage.*

**Last Updated:** October 2, 2025
