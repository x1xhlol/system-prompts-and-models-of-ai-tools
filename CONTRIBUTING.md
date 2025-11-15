# Contributing to System Prompts and Models of AI Tools

Thank you for your interest in contributing! This repository is a comprehensive collection of system prompts from AI coding tools and assistants.

## 🎯 What We're Looking For

### New Tools
- System prompts from AI coding assistants, IDEs, or agents
- Tool/function definitions (JSON schemas)
- Official or leaked prompts from production systems
- Both proprietary and open-source tools

### Updates
- New versions of existing tool prompts
- Additional files for existing tools
- Corrections to existing information
- Metadata improvements

### Enhancements
- Better categorization
- Improved documentation
- Analysis scripts
- Comparison tools

## 📋 Contribution Guidelines

### Adding a New Tool

1. **Create a directory** with the tool name:
   ```
   Tool Name/
   ```

2. **Add prompt files**:
   - Use descriptive names: `Prompt.txt`, `System Prompt.txt`, etc.
   - For multiple prompts: `Agent Prompt.txt`, `Chat Prompt.txt`
   - Include version if applicable: `Prompt v1.2.txt`

3. **Add tool definitions** (if available):
   - Use JSON format: `Tools.json`, `Agent Tools.json`
   - Include the full schema

4. **Create a README.md** in the directory:
   ```markdown
   # Tool Name

   Brief description of the tool.

   ## Contents
   - List of files and what they contain

   ## Models Used
   - AI models the tool uses

   ## Links
   - Official website
   - Documentation
   ```

5. **Update the main README.md**:
   - Add entry under "Available Files"
   - Keep alphabetical order within categories

6. **Update metadata** (if possible):
   - Edit `scripts/generate_metadata.py`
   - Add tool information to `TOOL_INFO` dictionary

### File Naming Conventions

- **Text files**: Use `.txt` extension
- **JSON files**: Use `.json` extension
- **Documentation**: Use `.md` extension
- **Spaces**: Allowed in file names (e.g., `Agent Prompt.txt`)
- **Versioning**: Include version in filename if multiple versions exist

### Quality Standards

1. **Completeness**: Include the full system prompt, not excerpts
2. **Accuracy**: Verify the prompt is current and correctly extracted
3. **Attribution**: Note the source, date, and version if known
4. **Privacy**: Remove any API keys, secrets, or personal information

### Commit Messages

Use clear, descriptive commit messages:

```
Add Claude Code 2.0 system prompt

- Added new system prompt for Claude Code 2.0
- Includes tool definitions
- Updated README with new entry
```

Follow conventional commits format:
- `feat:` New tool or feature
- `update:` Update to existing prompt
- `fix:` Corrections or bug fixes
- `docs:` Documentation changes
- `refactor:` Restructuring without functional changes

## 🔍 Verification Process

Before submitting:

1. **Run validation**:
   ```bash
   python scripts/validate.py
   ```

2. **Check links**:
   - Ensure all README links work
   - Verify directory names match exactly

3. **Test search**:
   ```bash
   python scripts/generate_metadata.py
   python scripts/search.py --text "your tool"
   ```

4. **Format check**:
   - Ensure files are UTF-8 encoded
   - Remove trailing whitespace
   - Use consistent line endings (LF)

## 🚫 What NOT to Submit

- **Incomplete prompts**: Partial or fragmentary prompts
- **Fake prompts**: Made-up or unverified content
- **Malware**: Any malicious code or exploits
- **Copyright violations**: Don't submit if legally questionable
- **Spam**: Promotional content unrelated to AI tools
- **Personal data**: Private API keys, emails, credentials

## 📊 Metadata Schema

When adding tools to `scripts/generate_metadata.py`:

```python
"Tool Name": {
    "name": "Display Name",
    "company": "Company Name",
    "category": "Code Assistant|IDE|AI Agent|Web Builder|etc.",
    "type": "proprietary|open-source",
    "description": "Brief description of what it does",
    "website": "https://example.com",
    "models": ["model-1", "model-2"]
}
```

### Categories
- **Code Assistant**: AI coding helpers
- **IDE**: Integrated development environments
- **AI Agent**: Autonomous agents
- **Web Builder**: UI/web generation tools
- **Terminal**: CLI-based tools
- **Document Assistant**: Documentation tools
- **Search Assistant**: Search/research tools
- **Foundation Model**: Base model prompts

## 🔄 Update Process

For updating existing tools:

1. Keep old versions (rename with date/version)
2. Add new version with clear naming
3. Update README to note changes
4. Document what changed in commit message

## 🤝 Code of Conduct

- Be respectful and constructive
- Focus on accuracy and quality
- Give credit where due
- Collaborate openly
- Respect intellectual property
- Maintain professional standards

## 📬 Questions?

- Open an issue for questions
- Join Discord for discussions
- Contact maintainer: via GitHub issues

## 🎁 Recognition

Contributors will be:
- Listed in commit history
- Mentioned in release notes
- Credited for significant additions

## 📜 License

By contributing, you agree that your contributions will be licensed under the repository's existing license.

---

Thank you for helping build the most comprehensive collection of AI tool system prompts! 🙏
