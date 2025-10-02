# Contributing to AI Coding Tools Repository

Thank you for your interest in contributing! This repository documents system prompts and tool definitions from production AI coding assistants.

---

## 🎯 What We're Looking For

### High-Priority Contributions:
1. **System prompts** from major AI coding tools
2. **Tool definitions** (JSON schemas)
3. **Version updates** of existing tools
4. **Missing tools** from our [MISSING_TOOLS.md](MISSING_TOOLS.md) list
5. **Analysis** of prompt patterns and best practices

### What We Accept:
- ✅ Official system prompts (publicly documented)
- ✅ Reverse-engineered prompts (from open source or public sources)
- ✅ Tool definition files (JSON schemas)
- ✅ Version-dated updates
- ✅ Documentation improvements

### What We Don't Accept:
- ❌ Proprietary prompts obtained through unauthorized means
- ❌ Prompts without clear source attribution
- ❌ Incomplete or partial prompts (unless clearly marked)
- ❌ Malicious or harmful content

---

## 📋 How to Contribute

### Option 1: Add a New Tool

1. **Fork the repository**
2. **Create a new directory** for the tool:
   ```
   ToolName/
   ├── Prompt.txt
   ├── Tools.json (if applicable)
   └── README.md
   ```

3. **Format files properly:**

   **Prompt.txt:**
   ```
   [Tool Name] System Prompt
   Version: [version number or date]
   Source: [URL or "reverse-engineered from [source]"]
   Date Captured: [YYYY-MM-DD]

   ---

   [Actual prompt content]
   ```

   **Tools.json:**
   ```json
   {
     "tools": [
       {
         "name": "tool_name",
         "description": "What the tool does",
         "parameters": {
           "type": "object",
           "properties": { ... },
           "required": [ ... ]
         }
       }
     ]
   }
   ```

   **README.md:**
   ```markdown
   # Tool Name

   **Type:** [IDE Plugin / CLI / Web Platform]
   **Availability:** [Free / Paid / Enterprise]
   **Website:** [URL]

   ## Overview
   Brief description of the tool

   ## Files in This Directory
   - `Prompt.txt` - System prompt (version X.Y)
   - `Tools.json` - Tool definitions

   ## Source
   How these files were obtained

   ## Date
   When these were captured

   ## Changes from Previous Version
   (If applicable)
   ```

4. **Update main README.md:**
   - Add tool to appropriate category
   - Include link to directory
   - Brief description

5. **Update COMPARISON.md:**
   - Add row to comparison table
   - Fill in features, pricing, model info

6. **Submit Pull Request**

---

### Option 2: Update Existing Tool

1. **Fork the repository**
2. **Find the tool directory**
3. **Add new version files:**
   ```
   ToolName/
   ├── Prompt-v1.0.txt (existing)
   ├── Prompt-v2.0.txt (new)
   └── CHANGELOG.md (update)
   ```

4. **Document changes:**
   - Create or update `CHANGELOG.md` in tool directory
   - Describe what changed between versions

5. **Submit Pull Request** with detailed description

---

### Option 3: Improve Documentation

1. **Fork the repository**
2. **Edit documentation files:**
   - Fix typos or errors
   - Add missing information
   - Improve clarity
   - Update outdated info

3. **Submit Pull Request**

---

### Option 4: Add Analysis

1. **Fork the repository**
2. **Create or update analysis files:**
   - `TOOL_PATTERNS.md` - Add new patterns
   - `BEST_PRACTICES.md` - Add practices
   - `SECURITY_PATTERNS.md` - Security insights
   - `EVOLUTION.md` - Historical analysis

3. **Submit Pull Request**

---

## 📝 Style Guidelines

### File Naming:
- Use descriptive names
- Version dates: `Prompt-2025-01-15.txt`
- Version numbers: `Prompt-v1.2.txt`
- Generic: `Prompt.txt` (for latest/only version)

### Markdown Formatting:
- Use proper headings (H1 for title, H2 for sections)
- Include code blocks with language tags
- Use tables for comparisons
- Add emojis sparingly for visual organization
- Keep lines under 120 characters where possible

### Prompt Formatting:
- Preserve original formatting (spaces, newlines, indentation)
- Use UTF-8 encoding
- Remove any actual secrets (replace with `[REDACTED]`)
- Include metadata header

---

## 🔍 How to Find Prompts

### Public Sources:
1. **Open source repositories:**
   - Check GitHub for open source AI tools
   - Look for `system_prompt.txt` or similar files

2. **Official documentation:**
   - Tool websites often document prompts
   - Developer docs, API references

3. **Blog posts & announcements:**
   - Companies sometimes share prompts publicly
   - Technical blog posts

4. **Community contributions:**
   - Discord, Reddit, Twitter discussions
   - Developer forums

### Reverse Engineering (Ethical):
1. **Browser DevTools:**
   - For web-based tools, check Network tab
   - Look for API calls with prompts

2. **IDE extension inspection:**
   - Some extensions include prompts in code
   - Check extension files in VS Code/JetBrains

3. **API documentation:**
   - Official APIs sometimes show system prompts
   - Look for example payloads

**Important:** Only reverse engineer tools you have legitimate access to.

---

## ✅ Pre-Submission Checklist

Before submitting a PR:

- [ ] Files are properly formatted
- [ ] All required files included (Prompt.txt, README.md)
- [ ] Source attribution is clear
- [ ] No secrets or credentials included
- [ ] Prompt is complete (not truncated)
- [ ] README.md updated
- [ ] COMPARISON.md updated (for new tools)
- [ ] Proper directory structure
- [ ] Markdown formatting is clean
- [ ] Commit messages are descriptive

---

## 🚀 Pull Request Process

1. **Create a descriptive PR title:**
   - Good: "Add Amazon CodeWhisperer system prompt v2.1"
   - Bad: "Update files"

2. **Provide detailed description:**
   ```markdown
   ## What this PR does
   - Adds system prompt for [Tool Name]
   - Updates comparison table
   - Includes tool definitions

   ## Source
   [How you obtained these files]

   ## Testing
   [How you verified accuracy]

   ## Additional context
   [Any other relevant info]
   ```

3. **Wait for review:**
   - Maintainers will review within 3-7 days
   - Address any feedback or questions
   - Make requested changes

4. **Merge:**
   - Once approved, PR will be merged
   - You'll be credited as contributor

---

## 🏆 Recognition

Contributors will be:
- Listed in README.md contributors section
- Credited in specific file headers
- Acknowledged in release notes

---

## 📜 Legal & Ethical Guidelines

### Acceptable:
- ✅ Publicly documented prompts
- ✅ Open source tool prompts
- ✅ Your own tools/prompts
- ✅ Prompts shared with permission

### Not Acceptable:
- ❌ Prompts obtained through hacking
- ❌ Violating terms of service
- ❌ Sharing confidential information
- ❌ Copyright infringement

### Gray Area (Use Judgment):
- 🟡 Reverse engineering tools you pay for
- 🟡 Community-shared prompts without official source

**When in doubt, ask in an issue first.**

---

## 💬 Communication

### Questions:
- Open a GitHub issue
- Tag with `question` label

### Discussions:
- Use GitHub Discussions
- Join our Discord: [link]

### Bug Reports:
- Open an issue
- Use bug report template

### Feature Requests:
- Open an issue
- Use feature request template

---

## 🎓 First-Time Contributors

New to open source? No problem!

1. **Start small:**
   - Fix a typo
   - Update documentation
   - Add a tool you know well

2. **Learn as you go:**
   - Read existing files for examples
   - Ask questions in issues
   - Don't be afraid to make mistakes

3. **Resources:**
   - [GitHub Fork Guide](https://docs.github.com/en/get-started/quickstart/fork-a-repo)
   - [Pull Request Tutorial](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
   - [Markdown Guide](https://www.markdownguide.org/)

---

## 📊 Priority Contributions

See [MISSING_TOOLS.md](MISSING_TOOLS.md) for high-priority tools we need:

**Critical Priority:**
1. AWS CodeWhisperer/Q Developer
2. Tabnine
3. Codeium
4. Sourcegraph Cody
5. Supermaven
6. JetBrains AI

**Version Updates Needed:**
- Cursor (newer versions)
- GitHub Copilot (latest model prompts)
- Claude Code (any updates)

---

## 🔄 Review Timeline

- **Initial response:** 3-7 days
- **Full review:** 7-14 days
- **Merge (if approved):** 1-3 days after final approval

Delays may occur during holidays or high contribution periods.

---

## 📅 Release Cycle

- **Minor updates:** Merged continuously
- **Major additions:** Included in monthly releases
- **Version tags:** Created for significant milestones

---

## 🙏 Thank You!

Your contributions help the AI coding community:
- Understand how tools work
- Compare different approaches
- Learn best practices
- Build better tools

Every contribution matters, no matter how small!

---

## 📞 Contact

- **GitHub Issues:** For questions and discussions
- **Email:** [maintainer email]
- **Discord:** [server invite]
- **Twitter:** [@handle]

---

**Ready to contribute? Check out [MISSING_TOOLS.md](MISSING_TOOLS.md) for ideas!**
