# Changelog

All notable changes to this repository will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.0.0] - 2025-11-15

### Added
- **Repository Infrastructure**
  - Created `scripts/` directory for automation tools
  - Added `generate_metadata.py` - Generates comprehensive metadata index
  - Added `validate.py` - Validates repository structure and links
  - Added `search.py` - Search and filter tools by criteria
  - Added `analyze.py` - Generate statistics and comparisons
  - Added `CONTRIBUTING.md` - Contribution guidelines
  - Added `CHANGELOG.md` - This changelog file

- **Documentation**
  - Added README.md for Anthropic directory
  - Added README.md for Cursor Prompts directory
  - Added README.md for Open Source prompts directory
  - Created comparison table generation

- **New Tools**
  - Added Emergent to README (previously unlisted)
  - Added Traycer AI to README (previously unlisted)

### Fixed
- Fixed broken link for Amp directory (was `./AMp/`, now `./Amp/`)
- Fixed file extension for `Traycer AI/plan_mode_prompts` (added `.txt`)
- Updated line count from "30,000+" to "25,000+" for accuracy

### Changed
- Improved README.md description and accuracy
- Enhanced repository organization
- Standardized metadata structure

### Tools & Scripts
The new scripts enable:
- **Metadata Generation**: `python scripts/generate_metadata.py`
- **Repository Validation**: `python scripts/validate.py`
- **Tool Search**: `python scripts/search.py --category "Code Assistant"`
- **Statistics**: `python scripts/analyze.py`

---

## [1.x] - 2024-2025

### Added
- Initial collection of 30+ AI tool prompts
- Prompts from major tools:
  - Cursor, VSCode Copilot, Claude Code
  - Devin, v0, Bolt, Windsurf
  - Replit, Lovable, Same.dev
  - And many more

- Open source tools:
  - Cline, RooCode, Lumo
  - Codex CLI, Gemini CLI
  - Bolt

### Structure
- Organized by tool/company
- Separate directories for each tool
- Mix of .txt and .json files
- Basic README with tool list

---

## Notes

### Version 2.0.0 Highlights
This major update transforms the repository from a simple collection to a searchable, analyzable, and well-documented resource. Key improvements:

1. **Discoverability**: Search tools by category, company, model, or keywords
2. **Validation**: Automated checks ensure quality and consistency
3. **Analysis**: Generate statistics and comparisons
4. **Documentation**: Individual READMEs explain each tool
5. **Standardization**: Consistent structure and metadata

### Future Enhancements
Planned for future versions:
- [ ] More individual tool READMEs
- [ ] Automated prompt version tracking
- [ ] Diff tools to compare prompt versions
- [ ] Web interface for browsing
- [ ] API for programmatic access
- [ ] Prompt analysis and insights
- [ ] Community ratings and reviews
- [ ] Integration examples

---

## How to Use This Changelog

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** in case of vulnerabilities

---

Last updated: 2025-11-15
