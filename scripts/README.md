# Repository Scripts

Automation and analysis tools for the AI tools prompt repository.

## 📋 Available Scripts

### 🔍 `generate_metadata.py`
Generates a comprehensive metadata index of all tools in the repository.

**Usage:**
```bash
python scripts/generate_metadata.py
```

**Output:**
- Creates `scripts/index.json` with complete tool metadata
- Shows statistics about tools, files, and line counts
- Categorizes tools by type, category, and company

**What it does:**
- Scans all directories for .txt, .json, and .md files
- Counts lines in text files
- Collects file sizes and metadata
- Organizes by predefined categories
- Generates searchable index

---

### ✅ `validate.py`
Validates repository structure and finds issues.

**Usage:**
```bash
python scripts/validate.py
```

**Checks performed:**
- ✓ README links point to valid directories
- ✓ All directories are listed in README
- ✓ No empty files exist
- ✓ File naming consistency
- ✓ Directory structure validity

**Exit codes:**
- `0` - All checks passed or only warnings
- `1` - Errors found

---

### 🔎 `search.py`
Search and filter tools by various criteria.

**Usage:**
```bash
# Search by category
python scripts/search.py --category "Code Assistant"

# Search by company
python scripts/search.py --company "Anthropic"

# Search by model
python scripts/search.py --model "gpt-5"

# Full-text search
python scripts/search.py --text "agent"

# Filter by type
python scripts/search.py --type "open-source"

# Verbose output
python scripts/search.py --category "IDE" --verbose

# List all categories
python scripts/search.py --list-categories

# List all companies
python scripts/search.py --list-companies
```

**Options:**
- `--category` - Filter by category (IDE, Code Assistant, etc.)
- `--company` - Filter by company name
- `--text` - Search in name and description
- `--model` - Filter by AI model used
- `--type` - Filter by type (proprietary/open-source)
- `--verbose, -v` - Show detailed information
- `--list-categories` - List all available categories
- `--list-companies` - List all companies

**Requirements:**
Run `generate_metadata.py` first to create the index.

---

### 📊 `analyze.py`
Generate comprehensive statistics and analysis.

**Usage:**
```bash
python scripts/analyze.py
```

**Analysis includes:**
- Overall repository statistics
- Tools by category (bar chart)
- Tools by company (bar chart)
- Tools by type (proprietary vs open-source)
- AI models usage
- Complexity analysis (by line count and file count)
- File size analysis
- Top 10 largest files

**Output:**
- Console output with colored charts
- `scripts/comparison_table.md` - Markdown comparison table

**Requirements:**
Run `generate_metadata.py` first to create the index.

---

## 🚀 Quick Start

**Complete analysis workflow:**
```bash
# 1. Generate metadata
python scripts/generate_metadata.py

# 2. Validate repository
python scripts/validate.py

# 3. View statistics
python scripts/analyze.py

# 4. Search for tools
python scripts/search.py --category "Code Assistant"
```

---

## 📁 Generated Files

Scripts generate the following files:

- `scripts/index.json` - Complete metadata index
- `scripts/comparison_table.md` - Markdown comparison table

These files are gitignored and regenerated on demand.

---

## 🔧 Technical Details

### Dependencies
All scripts use Python 3 standard library only. No external dependencies required.

### Python Version
Requires Python 3.6+

### File Structure
```
scripts/
├── README.md              # This file
├── generate_metadata.py   # Metadata generator
├── validate.py            # Validation tool
├── search.py              # Search tool
├── analyze.py             # Analysis tool
├── index.json            # Generated metadata (gitignored)
└── comparison_table.md    # Generated comparison (gitignored)
```

### Adding New Tools to Metadata

To add metadata for new tools, edit `generate_metadata.py`:

```python
TOOL_INFO = {
    "Tool Name": {
        "name": "Display Name",
        "company": "Company Name",
        "category": "Code Assistant",  # See categories below
        "type": "proprietary",  # or "open-source"
        "description": "Brief description",
        "website": "https://example.com",
        "models": ["model-1", "model-2"]
    }
}
```

**Categories:**
- `Code Assistant` - AI coding helpers
- `IDE` - Integrated development environments
- `AI Agent` - Autonomous agents
- `Web Builder` - UI/web generation tools
- `Terminal` - CLI-based tools
- `Cloud IDE` - Cloud development platforms
- `Document Assistant` - Documentation tools
- `Search Assistant` - Search/research tools
- `Foundation Model` - Base model prompts

---

## 🎨 Color Output

Scripts use ANSI color codes for better readability:
- 🔵 Blue - Headers and titles
- 🟢 Green - Success and data bars
- 🟡 Yellow - Warnings
- 🔴 Red - Errors

---

## 🤝 Contributing

To add new scripts:
1. Follow Python 3 standard library only (no external deps)
2. Add comprehensive docstrings
3. Update this README
4. Follow existing code style
5. Add usage examples

---

## 📄 License

Scripts are part of the main repository and follow the same license.

---

[← Back to main repository](../)
