# Changelog

All notable changes to this repository will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- COMPARISON.md - Comprehensive feature comparison of all 31 tools
- QUICK_REFERENCE.md - Quick tool finder and decision tree
- TOOL_PATTERNS.md - Analysis of 26 common patterns across tools
- BEST_PRACTICES.md - Extracted best practices from all tools
- SECURITY_PATTERNS.md - Security guidelines and patterns
- EVOLUTION.md - How prompts have evolved from 2023 to 2025
- MISSING_TOOLS.md - List of 22 notable tools to add
- CONTRIBUTING.md - Comprehensive contribution guidelines
- CHANGELOG.md - This file

---

## [2.0.0] - 2025-01-XX (Planned)

### Added
- Comprehensive documentation overhaul
- Analysis and comparison documents
- Contribution guidelines
- Missing tools documentation

### Changed
- Repository structure reorganization (planned)
- Enhanced static site with search and filters (planned)
- Improved README with better organization (planned)

---

## [1.4.0] - 2025-01-02

### Added
- VSCode Agent prompts for multiple models
  - claude-sonnet-4.txt
  - gemini-2.5-pro.txt
  - gpt-4.1.txt
  - gpt-5.txt
  - gpt-5-mini.txt

### Updated
- VSCode Agent Prompt.txt

---

## [1.3.0] - 2024-12-XX

### Added
- Windsurf Wave 11 prompts and tools
- Traycer AI phase and plan mode prompts
- Z.ai Code prompts

---

## [1.2.0] - 2024-11-XX

### Added
- Cursor Agent CLI Prompt 2025-08-07
- Cursor Agent Prompt 2025-09-03
- Amp gpt-5.yaml configuration

### Updated
- Cursor Agent tools and prompts

---

## [1.1.0] - 2024-10-XX

### Added
- Augment Code prompts for Claude 4 Sonnet and GPT-5
- Tool definitions for Augment Code
- Manus Agent complete tool set
- Same.dev prompts and tools
- Trae builder and chat prompts

### Updated
- README.md with new tools

---

## [1.0.0] - 2024-09-XX

### Added
- Initial repository structure
- Claude Code system prompts and tools
- Cursor prompts (v1.0, v1.2, Agent, Memory)
- GitHub Copilot prompts
- Windsurf prompts
- Bolt (Open Source) prompts
- v0 prompts and tools
- Replit prompts and tools
- Devin AI prompts
- 20+ other AI coding tool prompts
- Static site generator (site/build.js)
- GitHub Actions deployment
- README.md with comprehensive tool list
- INSTALL.md with setup instructions
- LICENSE.md (GPL v3.0)

---

## Tool-Specific Changelogs

### Cursor
- **2025-01-03:** Agent CLI Prompt 2025-08-07
- **2024-11-09:** Agent Prompt 2025-09-03
- **2024-09-XX:** Agent Prompt v1.2
- **2024-08-XX:** Agent Prompt v1.0
- **2024-07-XX:** Chat Prompt, Memory Prompt

### GitHub Copilot (VSCode)
- **2025-01-02:** Added claude-sonnet-4, gemini-2.5-pro, gpt-4.1, gpt-5, gpt-5-mini
- **2024-XX-XX:** Initial gpt-4o prompt

### Windsurf
- **2024-12-XX:** Wave 11 prompts and tools

### Amp
- **2024-11-XX:** GPT-5 configuration added
- **2024-09-XX:** Claude 4 Sonnet configuration

### Claude Code
- **2024-09-XX:** Initial system prompt and tools

---

## Repository Statistics

### Total Files by Category:

| Category | Count | Notes |
|----------|-------|-------|
| System Prompts | 85+ | .txt files |
| Tool Definitions | 15+ | .json files |
| Documentation | 8 | .md files |
| Configuration | 3 | YAML, package.json |
| Scripts | 1 | build.js |
| **Total** | **112+** | As of 2025-01-02 |

### Tools Documented:

| Status | Count |
|--------|-------|
| Complete (Prompt + Tools) | 20+ |
| Prompt Only | 10+ |
| **Total Tools** | **31** |

---

## Breaking Changes

### v2.0.0 (Planned)
- Directory structure will be reorganized
- Some file paths may change
- Static site URLs may change

### v1.0.0
- Initial release, no breaking changes

---

## Migration Guides

### Upgrading to v2.0.0 (When Released)

If you've cloned this repository:
1. Pull latest changes: `git pull origin main`
2. Note: File paths may have changed
3. Update any scripts that reference old paths
4. Static site will be regenerated automatically

---

## Future Planned Changes

### v2.1.0 (Q1 2025)
- [ ] Add missing critical tools (CodeWhisperer, Tabnine, Codeium)
- [ ] Enhanced static site with search
- [ ] Tool-specific README files
- [ ] Metadata system (JSON for each tool)

### v2.2.0 (Q2 2025)
- [ ] Automation scripts (validate.js, analyze.js)
- [ ] Visual elements (architecture diagrams, workflow charts)
- [ ] Community features (ratings, comments)
- [ ] Version comparison tool

### v3.0.0 (Q3 2025)
- [ ] Major repository reorganization
- [ ] API for programmatic access
- [ ] Advanced analytics and insights
- [ ] Collaborative features

---

## Deprecations

### Planned Deprecations:
- None at this time

### Deprecated Features:
- None at this time

---

## Security Updates

### v1.4.0
- Removed any accidentally committed secrets (if found)
- Added .gitignore for sensitive files

### v1.0.0
- Initial security review completed
- All prompts sanitized for secrets

---

## Contributors

### Core Maintainers:
- [@sahiixx](https://github.com/sahiixx) - Repository owner

### Contributors:
- Community contributions welcome!
- See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines

---

## Acknowledgments

### Data Sources:
- Official tool documentation
- Open source repositories
- Community reverse engineering
- Public blog posts and announcements

### Special Thanks:
- All AI tool developers for creating these amazing tools
- Community members who shared prompts
- Contributors who helped improve documentation

---

## Version History Summary

| Version | Date | Major Changes | Files Added |
|---------|------|---------------|-------------|
| 1.0.0 | 2024-09 | Initial release | 90+ |
| 1.1.0 | 2024-10 | Added 5+ tools | 15+ |
| 1.2.0 | 2024-11 | Cursor updates, Amp GPT-5 | 5+ |
| 1.3.0 | 2024-12 | Windsurf Wave 11, Traycer, Z.ai | 8+ |
| 1.4.0 | 2025-01 | VSCode multi-model support | 5+ |
| 2.0.0 | 2025-01 (planned) | Documentation overhaul | 10+ |

---

## Release Notes

### v1.4.0 - VSCode Multi-Model Support
**Released: 2025-01-02**

This release adds comprehensive model support for GitHub Copilot in VS Code:

**New Files:**
- `VSCode Agent/claude-sonnet-4.txt`
- `VSCode Agent/gemini-2.5-pro.txt`
- `VSCode Agent/gpt-4.1.txt`
- `VSCode Agent/gpt-5.txt`
- `VSCode Agent/gpt-5-mini.txt`

**Insights:**
- Different models have different prompt optimizations
- GPT-5 prompts emphasize conciseness and efficiency
- Claude prompts focus on thoroughness and tool use
- Gemini prompts balance both approaches

**For Users:**
- Compare how different models are instructed
- Understand model-specific capabilities
- Learn best practices for each model

---

### v1.3.0 - Wave 11 & New Tools
**Released: 2024-12-XX**

**Added:**
- Windsurf Wave 11 (latest cascade architecture)
- Traycer AI (phase and plan modes)
- Z.ai Code prompts

**Highlights:**
- Windsurf Wave 11 shows evolution of cascade pattern
- Traycer AI demonstrates multi-mode agent design
- Growing collection of autonomous coding agents

---

### v1.2.0 - Cursor Evolution
**Released: 2024-11-XX**

**Added:**
- Cursor Agent CLI Prompt (2025-08-07)
- Cursor Agent Prompt (2025-09-03)
- Amp GPT-5 configuration

**Highlights:**
- Cursor's rapid iteration visible through versioned prompts
- CLI-specific optimizations documented
- Amp adds GPT-5 support alongside Claude

---

### v1.1.0 - Tool Expansion
**Released: 2024-10-XX**

**Added:**
- Augment Code (Claude 4 Sonnet + GPT-5)
- Manus Agent (complete tool set)
- Same.dev
- Trae (builder + chat)

**Highlights:**
- First tools with both Claude and GPT variants
- Comprehensive tool definitions (Manus)
- Growing diversity of tool approaches

---

### v1.0.0 - Initial Release
**Released: 2024-09-XX**

**Launched with:**
- 31 AI coding tools documented
- 90+ files (prompts, tools, configs)
- Static site generator
- GitHub Pages deployment
- Comprehensive README

**Foundation:**
- Established repository structure
- Set documentation standards
- Created community resource

---

## Statistics & Metrics

### Growth Over Time:

| Metric | v1.0.0 | v1.4.0 | Growth |
|--------|--------|--------|--------|
| Tools | 26 | 31 | +19% |
| Files | 90+ | 112+ | +24% |
| Documentation | 3 | 8 | +167% |
| GitHub Stars | 0 | TBD | - |
| Contributors | 1 | TBD | - |

### File Breakdown:

| File Type | Count |
|-----------|-------|
| .txt (prompts) | 85+ |
| .json (tools) | 15+ |
| .md (docs) | 8 |
| .yaml (configs) | 2 |
| .js (scripts) | 1 |
| .png (images) | 1 |
| **Total** | **112+** |

---

## Roadmap

### Q1 2025
- ✅ Documentation overhaul
- ⏳ Add missing critical tools
- ⏳ Enhanced static site
- ⏳ Community features

### Q2 2025
- ⏳ Automation scripts
- ⏳ Visual elements
- ⏳ Advanced analytics
- ⏳ API development

### Q3 2025
- ⏳ Major reorganization
- ⏳ Version comparison tool
- ⏳ Collaborative features
- ⏳ Mobile-friendly site

### Q4 2025
- ⏳ v3.0.0 release
- ⏳ Community growth
- ⏳ Partnership programs
- ⏳ Educational content

---

## Contact & Support

- **Issues:** [GitHub Issues](https://github.com/sahiixx/system-prompts-and-models-of-ai-tools/issues)
- **Discussions:** [GitHub Discussions](https://github.com/sahiixx/system-prompts-and-models-of-ai-tools/discussions)
- **Discord:** [Join our community]
- **Twitter:** [@sahiixx]

---

*Last Updated: 2025-01-02*
*Repository: github.com/sahiixx/system-prompts-and-models-of-ai-tools*
