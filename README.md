# **System Prompts and Models of AI Tools**  
---
<p align="center">
  <sub>Special thanks to</sub>  
</p>

<## 📚 Repository Documentation

This repository now includes comprehensive analysis and reference materials:

### 🔍 Quick Reference & Comparison
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Tool finder, decision tree, budget guide
- **[COMPARISON.md](./COMPARISON.md)** - Feature matrix comparing all 32 tools

### 📚 Analysis & Patterns
- **[TOOL_PATTERNS.md](./TOOL_PATTERNS.md)** - 26 common patterns across AI tools
- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Extracted best practices from all tools
- **[SECURITY_PATTERNS.md](./SECURITY_PATTERNS.md)** - Security guidelines and patterns
- **[EVOLUTION.md](./EVOLUTION.md)** - How prompts evolved from 2023 to 2025
- **[VISUALIZATIONS.md](./VISUALIZATIONS.md)** - 15+ Mermaid diagrams and architecture charts
- **[REVERSE_ENGINEERING_GUIDE.md](./REVERSE_ENGINEERING_GUIDE.md)** - How to extract system prompts

### 🤝 Contributing & Community
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute to this repository
- **[MISSING_TOOLS.md](./MISSING_TOOLS.md)** - 22 notable tools we need to add
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and updates

### 🚀 New Features

#### 📊 **Metadata System**
- **32 JSON metadata files** with structured data for all tools
- **Automated metadata generation** using `scripts/generate-metadata.py`
- **Consistent schema** across all tools (type, pricing, features, models, patterns)
- **Version tracking** for prompt evolution
- **[Metadata README](./metadata/README.md)** - Complete schema documentation

#### 🔌 **REST API Endpoints**
- **39 JSON API endpoints** for programmatic access
- **6 aggregate endpoints:** index, by-type, by-pricing, features, statistics, search
- **32 individual tool endpoints** in `/api/tools/`
- **Easy integration** with any programming language
- **[API README](./api/README.md)** - Complete API documentation with examples

```javascript
// Example: Fetch all tools
fetch('./api/index.json')
  .then(res => res.json())
  .then(data => console.log(data.tools));
```

#### 🎨 **Enhanced Site Generator**
- **Modern UI** with dark/light theme toggle
- **Full-text search** across all files and tools
- **Advanced filters** by type, pricing, and features
- **Three view modes:** Files, Tools, Comparison
- **Syntax highlighting** with one-click code copying
- **Mobile-responsive** design
- **Run:** `cd site && npm install && node build-enhanced.js`

#### 🔄 **Version Comparison Tool**
- **Side-by-side diff viewer** for prompt versions
- **HTML visualization** with syntax highlighting
- **Similarity scoring** and change statistics
- **Batch comparison** for all versions
- **Run:** `python scripts/compare-versions.py --tool "Cursor Prompts" --all`

#### 🤖 **Automation Scripts**
- **Metadata generator:** Auto-detect patterns, features, versions
- **API generator:** Create all 39 endpoints automatically
- **Version comparator:** Track prompt evolution
- **Validation scripts:** Ensure data consistency
- **See:** `scripts/` directory for all automation tools

#### 📖 **Complete Documentation**
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Full feature overview
- **[metadata/README.md](./metadata/README.md)** - Metadata schema guide
- **[api/README.md](./api/README.md)** - API usage examples
- **[scripts/METADATA_GENERATION.md](./scripts/METADATA_GENERATION.md)** - Generator docs
- **[scripts/VERSION_COMPARISON.md](./scripts/VERSION_COMPARISON.md)** - Comparison guide
  <a href="https://latitude.so/developers?utm_source=github&utm_medium=readme&utm_campaign=prompt_repo_sponsorship">
    <img src="assets/Latitude_logo.png" alt="Latitude Logo" width="700"/>
  </a>
</p>

<div align="center" markdown="1">

### [The tools you need for building reliable Agents and Prompts](https://latitude.so/developers?utm_source=github&utm_medium=readme&utm_campaign=prompt_repo_sponsorship)  
[Open Source AI Engineering Platform](https://latitude.so/developers?utm_source=github&utm_medium=readme&utm_campaign=prompt_repo_sponsorship)<br>

</div>


---

<a href="https://discord.gg/NwzrWErdMU" target="_blank">
  <img src="https://img.shields.io/discord/1402660735833604126?label=LeaksLab%20Discord&logo=discord&style=for-the-badge" alt="LeaksLab Discord" />
</a>

> **Join the Conversation:** New system instructions are released on Discord **before** they appear in this repository. Get early access and discuss them in real time.


<a href="https://trendshift.io/repositories/14084" target="_blank"><img src="https://trendshift.io/api/badge/repositories/14084" alt="x1xhlol%2Fsystem-prompts-and-models-of-ai-tools | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>

📜 Over **20,000+ lines** of insights into their structure and functionality.  

⭐ **Star to follow updates**

[![Build Status](https://app.cloudback.it/badge/x1xhlol/system-prompts-and-models-of-ai-tools)](https://cloudback.it)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/x1xhlol/system-prompts-and-models-of-ai-tools)

---

## ❤️ Support the Project

If you find this collection valuable and appreciate the effort involved in obtaining and sharing these insights, please consider supporting the project. Your contribution helps keep this resource updated and allows for further exploration.

You can show your support via:

- **PayPal:** `lucknitelol@proton.me`
- **Cryptocurrency:**  
  - **BTC:** `bc1q7zldmzjwspnaa48udvelwe6k3fef7xrrhg5625`  
  - **LTC:** `LRWgqwEYDwqau1WeiTs6Mjg85NJ7m3fsdQ`  
  - **ETH:** `0x3f844B2cc3c4b7242964373fB0A41C4fdffB192A`
- **Patreon:** https://patreon.com/lucknite
- **Ko-fi:** https://ko-fi.com/lucknite

🙏 Thank you for your support!

---

## 🚀 Installation & Deployment

### Quick Start

```bash
# Clone the repository
git clone https://github.com/sahiixx/system-prompts-and-models-of-ai-tools.git
cd system-prompts-and-models-of-ai-tools

# Install and build the website
cd site
npm install
npm run build

# Preview locally
npm run preview
```

### Deployment Options

- **GitHub Pages**: Automatically deployed on push to main branch
- **Vercel/Netlify**: Connect your repository for automatic deployments  
- **Custom hosting**: Upload the `site/dist` folder to any web server

📖 **[Complete Installation Guide](./INSTALL.md)** - Detailed setup instructions

---

## 🌐 Live Website

🔗 **[Browse System Prompts Online](https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/)**

The website provides an organized view of all system prompts with:
- 📁 Directory-based navigation
- 🔍 Individual file viewing with syntax highlighting  
- 📊 Repository statistics and file counts
- 📱 Mobile-friendly responsive design

---

## 📑 Table of Contents

  - [📑 Table of Contents](#-table-of-contents)
  - [🚀 Installation \& Deployment](#-installation--deployment)
  - [🌐 Live Website](#-live-website)
  - [� Repository Documentation](#-repository-documentation)
  - [�📂 Available Files](#-available-files)
  - [🎯 Tool Selection Guide](#-tool-selection-guide)
  - [📈 Repository Statistics](#-repository-statistics)
  - [🤝 Contributing](#-contributing)
  - [🛠 Roadmap \& Feedback](#-roadmap--feedback)
  - [🔗 Connect With Me](#-connect-with-me)
  - [🛡️ Security Notice for AI Startups](#️-security-notice-for-ai-startups)
  - [📊 Star History](#-star-history)

---

## � Repository Documentation

This repository now includes comprehensive analysis and reference materials:

### 🔍 Quick Reference & Comparison
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Tool finder, decision tree, budget guide
- **[COMPARISON.md](./COMPARISON.md)** - Feature matrix comparing all 31 tools

### 📚 Analysis & Patterns
- **[TOOL_PATTERNS.md](./TOOL_PATTERNS.md)** - 26 common patterns across AI tools
- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Extracted best practices from all tools
- **[SECURITY_PATTERNS.md](./SECURITY_PATTERNS.md)** - Security guidelines and patterns
- **[EVOLUTION.md](./EVOLUTION.md)** - How prompts evolved from 2023 to 2025

### 🤝 Contributing & Community
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute to this repository
- **[MISSING_TOOLS.md](./MISSING_TOOLS.md)** - 22 notable tools we need to add
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and updates

---

## �📂 Available Files

- [**v0**](./v0%20Prompts%20and%20Tools/)
- [**Manus**](./Manus%20Agent%20Tools%20&%20Prompt/)
- [**Augment Code**](./Augment%20Code/)
- [**Lovable**](./Lovable/)
- [**Devin**](./Devin%20AI/)
- [**Same.dev**](./Same.dev/)
- [**Replit**](./Replit/)
- [**Windsurf Agent**](./Windsurf/)
- [**VSCode (Copilot) Agent**](./VSCode%20Agent/)
- [**Cursor**](./Cursor%20Prompts/)
- [**Dia**](./dia/)
- [**Trae AI**](./Trae/)
- [**Perplexity**](./Perplexity/)
- [**Cluely**](./Cluely/)
- [**Xcode**](./Xcode/)
- [**Leap.new**](./Leap.new/)
- [**Notion AI**](./NotionAi/)
- [**Orchids.app**](./Orchids.app/)
- [**Junie**](./Junie/)
- [**Kiro**](./Kiro/)
- [**Warp.dev**](./Warp.dev/)
- [**Z.ai Code**](./Z.ai%20Code/)
- [**Qoder**](./Qoder/)
- [**Claude Code**](./Claude%20Code/)
- [**Open Source prompts**](./Open%20Source%20prompts/)
  - [Codex CLI](./Open%20Source%20prompts/Codex%20CLI/)
  - [Cline](./Open%20Source%20prompts/Cline/)
  - [Bolt](./Open%20Source%20prompts/Bolt/)
  - [RooCode](./Open%20Source%20prompts/RooCode/)
  - [Lumo](./Open%20Source%20prompts/Lumo/)
  - [Gemini CLI](./Open%20Source%20prompts/Gemini%20CLI/)
- [**CodeBuddy**](./CodeBuddy%20Prompts/)
- [**Poke**](./Poke/)
- [**Comet Assistant**](./Comet%20Assistant/)
- [**Anthropic**](./Anthropic/)
- [**Amp**](./AMp/)

---

## 🎯 Tool Selection Guide

### 💡 Not Sure Which Tool to Use?

**Start here:**
1. 📖 **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Decision tree and quick finder
2. 📊 **[COMPARISON.md](./COMPARISON.md)** - Compare features, pricing, and capabilities
3. 🔍 **[TOOL_PATTERNS.md](./TOOL_PATTERNS.md)** - Understand what makes each tool unique

### Quick Recommendations:

| Budget | Skill Level | Recommendation |
|--------|-------------|----------------|
| **Free** | Beginner | GitHub Copilot (free for students), Cline (open source) |
| **Free** | Advanced | Codeium (unlimited free), Continue.dev (self-hosted) |
| **$20/mo** | Any | Cursor (best all-around), Claude Code (terminal power users) |
| **Enterprise** | Team | Cursor Business, Tabnine Enterprise, Sourcegraph Cody |
| **Autonomous** | Advanced | Devin, Poke, Claude Code |

See **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** for detailed selection criteria.

---

## 📈 Repository Statistics

| Metric | Count | Notes |
|--------|-------|-------|
| **AI Tools Documented** | 32 | Production tools with prompts |
| **Total Files** | 140+ | Prompts, tools, docs, configs, metadata, APIs |
| **System Prompts** | 85+ | .txt files |
| **Tool Definitions** | 15+ | .json schemas |
| **Metadata Files** | 32 | Structured JSON data for all tools |
| **API Endpoints** | 39 | RESTful JSON APIs |
| **Documentation** | 20+ | Analysis, guides, and technical docs |
| **Lines of Content** | 50,000+ | Comprehensive insights & automation |
| **Automation Scripts** | 9 | Python & Node.js tools |
| **Visualizations** | 15+ | Mermaid diagrams |
| **Coverage** | ~65% | Of major AI coding tools |

### Missing Major Tools:
- AWS CodeWhisperer/Q Developer
- Tabnine
- Codeium
- Sourcegraph Cody
- Supermaven
- JetBrains AI

**See [MISSING_TOOLS.md](./MISSING_TOOLS.md) for the full list**

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### High-Priority Contributions:
1. **Add missing tools** (see [MISSING_TOOLS.md](./MISSING_TOOLS.md))
2. **Update existing tool prompts** with newer versions
3. **Improve documentation** and analysis
4. **Share insights** about prompt patterns

### Quick Start:
```bash
# Fork the repository
# Create a new branch
git checkout -b add-new-tool

# Add your files (see CONTRIBUTING.md for structure)
# Commit and push
git commit -m "Add [Tool Name] system prompt"
git push origin add-new-tool

# Open a Pull Request
```

📖 **[Full Contributing Guide](./CONTRIBUTING.md)** - Detailed instructions, style guide, and submission process

---

## 🛠 Roadmap & Feedback

> Open an issue.

> **Latest Update:** 02/10/2025

---

## 🔗 Connect With Me

- **X:** [NotLucknite](https://x.com/NotLucknite)
- **Discord**: `x1xh`

---

## 🛡️ Security Notice for AI Startups

> ⚠️ **Warning:** If you're an AI startup, make sure your data is secure. Exposed prompts or AI models can easily become a target for hackers.

> 🔐 **Important:** Interested in securing your AI systems?  
> Check out **[ZeroLeaks](https://zeroleaks.io/)**, a service designed to help startups **identify and secure** leaks in system instructions, internal tools, and model configurations. **Get a free AI security audit** to ensure your AI is protected from vulnerabilities.

*The company is mine, this is NOT a 3rd party AD.*

---

## 📊 Star History

<a href="https://www.star-history.com/#x1xhlol/system-prompts-and-models-of-ai-tools&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=x1xhlol/system-prompts-and-models-of-ai-tools&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=x1xhlol/system-prompts-and-models-of-ai-tools&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=x1xhlol/system-prompts-and-models-of-ai-tools&type=Date" />
  </picture>
</a>

⭐ **Drop a star if you find this useful!**
