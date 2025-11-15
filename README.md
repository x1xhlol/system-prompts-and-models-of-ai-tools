# **System Prompts and Models of AI Tools**  
---
<p align="center">
  <sub>Special thanks to</sub>  
</p>

<p align="center">
  <a href="https://latitude.so/developers?utm_source=github&utm_medium=readme&utm_campaign=prompt_repo_sponsorship" target="_blank">
    <img src="assets/Latitude_logo.png" alt="Latitude Logo" width="700"/>
  </a>
</p>

<div align="center" markdown="1">

### <a href="https://latitude.so/developers?utm_source=github&utm_medium=readme&utm_campaign=prompt_repo_sponsorship" target="_blank">The tools you need for building reliable Agents and Prompts</a>  
<a href="https://latitude.so/developers?utm_source=github&utm_medium=readme&utm_campaign=prompt_repo_sponsorship" target="_blank">Open Source AI Engineering Platform</a><br>

</div>

---

<a href="https://discord.gg/NwzrWErdMU" target="_blank">
  <img src="https://img.shields.io/discord/1402660735833604126?label=LeaksLab%20Discord&logo=discord&style=for-the-badge" alt="LeaksLab Discord" />
</a>

> **Join the Conversation:** New system instructions are released on Discord **before** they appear in this repository. Get early access and discuss them in real time.


<a href="https://trendshift.io/repositories/14084" target="_blank"><img src="https://trendshift.io/api/badge/repositories/14084" alt="x1xhlol%2Fsystem-prompts-and-models-of-ai-tools | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>

📜 Over **25,000+ lines** of insights into 32+ AI coding tools and their system prompts.  

⭐ **Star to follow updates**

[![Build Status](https://app.cloudback.it/badge/x1xhlol/system-prompts-and-models-of-ai-tools)](https://cloudback.it)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/x1xhlol/system-prompts-and-models-of-ai-tools)

---

## ❤️ Support the Project

If you find this collection valuable and appreciate the effort involved in obtaining and sharing these insights, please consider supporting the project. Your contribution helps keep this resource updated and allows for further exploration.

You can show your support via:

- **PayPal:** `lucknitelol@pm.me`
- **Cryptocurrency:**  
  - **BTC:** `bc1q7zldmzjwspnaa48udvelwe6k3fef7xrrhg5625`  
  - **LTC:** `LRWgqwEYDwqau1WeiTs6Mjg85NJ7m3fsdQ`  
  - **ETH:** `0x3f844B2cc3c4b7242964373fB0A41C4fdffB192A`
- **Patreon:** https://patreon.com/lucknite
- **Ko-fi:** https://ko-fi.com/lucknite

🙏 Thank you for your support!

---

# Sponsors

## Support the Future of AI Development

Sponsor the most comprehensive collection of AI system prompts and reach thousands of developers building the next generation of AI applications.

[Get Started](mailto:lucknitelol@proton.me)

---

## 📑 Table of Contents

  - [📑 Table of Contents](#-table-of-contents)
  - [🚀 Quick Start](#-quick-start)
  - [📂 Available Tools](#-available-tools)
  - [🔍 Search & Discovery](#-search--discovery)
  - [🛠 Roadmap \& Feedback](#-roadmap--feedback)
  - [🔗 Connect With Me](#-connect-with-me)
  - [🛡️ Security Notice for AI Startups](#️-security-notice-for-ai-startups)
  - [📊 Star History](#-star-history)

---

## 🚀 Quick Start

### 🌐 Web Interface (NEW!)

The easiest way to explore AI prompts is through our modern web interface:

```bash
cd web
./setup.sh
npm run dev
```

Visit **http://localhost:3000** to explore:
- 🔍 **Advanced search** and filtering
- 📊 **Statistics dashboard** with visualizations
- 🔄 **Compare tools** side-by-side
- 📱 **Fully responsive** mobile-friendly design
- 🎨 **Dark mode** support

See [web/README.md](./web/README.md) for full documentation.

### 📟 Command Line Tools

For developers who prefer the terminal:

```bash
# Generate metadata index
python scripts/generate_metadata.py

# Search by category
python scripts/search.py --category "Code Assistant"

# Search by company
python scripts/search.py --company "Anthropic"

# View statistics
python scripts/analyze.py

# Validate repository
python scripts/validate.py
```

### What's Included
Each tool directory contains:
- **System prompts** - The core instructions that guide AI behavior
- **Tool definitions** - JSON schemas for function calling and tool use
- **Documentation** - READMEs explaining the tool and its features

---

## 📂 Available Tools

### 🏢 IDEs & Code Editors
AI-powered development environments with integrated assistants

- [**Cursor**](./Cursor%20Prompts/) - AI-first code editor with agent mode
- [**VSCode (Copilot) Agent**](./VSCode%20Agent/) - GitHub Copilot for VSCode
- [**Windsurf**](./Windsurf/) - Codeium's AI-powered editor
- [**Xcode**](./Xcode/) - Apple's IDE with AI features

### 🤖 Autonomous AI Agents
Tools that can independently execute complex coding tasks

- [**Devin**](./Devin%20AI/) - Autonomous AI software engineer
- [**Emergent**](./Emergent/) - AI coding agent
- [**Manus**](./Manus%20Agent%20Tools%20&%20Prompt/) - Agent with loop and modules
- [**Poke**](./Poke/) - Multi-part agent system
- [**Trae**](./Trae/) - Builder and chat modes
- [**Traycer AI**](./Traycer%20AI/) - Multi-mode agent (Phase, Plan)

### 💻 Code Assistants
AI helpers for code completion, generation, and analysis

- [**Augment Code**](./Augment%20Code/) - AI-powered code completion
- [**Claude Code**](./Claude%20Code/) - Anthropic's official coding interface
- [**Cluely**](./Cluely/) - Default and enterprise modes
- [**CodeBuddy**](./CodeBuddy%20Prompts/) - Chat and Craft modes
- [**Comet Assistant**](./Comet%20Assistant/) - General purpose coding AI
- [**Dia**](./dia/) - AI coding assistant
- [**Junie**](./Junie/) - AI coding helper
- [**Kiro**](./Kiro/) - Multi-mode assistant (Spec, Vibe)
- [**Qoder**](./Qoder/) - Quest-based code assistant
- [**Same.dev**](./Same.dev/) - AI coding assistant
- [**Z.ai Code**](./Z.ai%20Code/) - AI coding tool

### 🌐 Web & App Builders
AI tools for building full applications and UIs

- [**v0**](./v0%20Prompts%20and%20Tools/) - Vercel's AI UI generation
- [**Lovable**](./Lovable/) - AI-powered app builder
- [**Leap.new**](./Leap.new/) - AI web application builder
- [**Bolt**](./Open%20Source%20prompts/Bolt/) - Full-stack web development

### 🏭 Cloud Platforms
Integrated development platforms with AI

- [**Replit**](./Replit/) - Cloud IDE with AI agent
- [**Amp**](./Amp/) - AI coding platform

### 🖥️ Terminal & CLI
Command-line AI assistants

- [**Warp.dev**](./Warp.dev/) - AI-powered terminal
- [**Codex CLI**](./Open%20Source%20prompts/Codex%20CLI/) - OpenAI Codex CLI
- [**Gemini CLI**](./Open%20Source%20prompts/Gemini%20CLI/) - Google Gemini CLI

### 🧠 Foundation Models
Core AI model prompts from major providers

- [**Anthropic**](./Anthropic/) - Claude Sonnet 4.5 & Claude Code 2.0
- [**Perplexity**](./Perplexity/) - AI search and answer engine

### 📝 Document & Knowledge
AI assistants for documentation and knowledge work

- [**Notion AI**](./NotionAi/) - Integrated into Notion
- [**Orchids.app**](./Orchids.app/) - Decision-making AI assistant

### 🌟 Open Source Collection
Community-built and transparent AI tools

- [**Cline**](./Open%20Source%20prompts/Cline/) - Autonomous VSCode agent
- [**RooCode**](./Open%20Source%20prompts/RooCode/) - Comprehensive assistant
- [**Lumo**](./Open%20Source%20prompts/Lumo/) - Lightweight coding AI
- [**Bolt**](./Open%20Source%20prompts/Bolt/) - Full-stack web tool

---

## 🔍 Search & Discovery

### Using Search Tools

**Search by category:**
```bash
python scripts/search.py --category "Code Assistant"
```

**Find tools by company:**
```bash
python scripts/search.py --company "Anthropic"
```

**Search for specific models:**
```bash
python scripts/search.py --model "gpt-5"
```

**Full-text search:**
```bash
python scripts/search.py --text "agent"
```

**Detailed view:**
```bash
python scripts/search.py --category "IDE" --verbose
```

### Analysis & Statistics

**Generate comprehensive statistics:**
```bash
python scripts/analyze.py
```

**Validate repository structure:**
```bash
python scripts/validate.py
```

### Quick Reference

**List all categories:**
```bash
python scripts/search.py --list-categories
```

**List all companies:**
```bash
python scripts/search.py --list-companies
```

---

## 🛠 Roadmap & Feedback

### What's New in v2.0 🎉

**🌐 Modern Web Interface:**
- ✨ **Next.js 15 + React 19** web application
- 🔍 **Advanced search** with real-time filtering
- 📊 **Interactive statistics** dashboard
- 🔄 **Side-by-side comparison** of up to 4 tools
- 📱 **Fully responsive** mobile design
- 🎨 **Dark mode** with theme persistence
- ⚡ **Lightning fast** with Server Components

**📁 Repository Enhancements:**
- 📚 **Better Documentation**: Individual READMEs for key tools
- 🗂️ **Organized by Category**: Browse by IDE, Agent, Assistant, etc.
- ✅ **Validation**: Automated quality checks
- 📊 **Analysis Tools**: Generate statistics and comparisons

**🛠️ Developer Tools:**
- `generate_metadata.py` - Create searchable index
- `validate.py` - Check repository quality
- `search.py` - Search and filter tools
- `analyze.py` - Generate statistics

See [CHANGELOG.md](./CHANGELOG.md) for full details.

### Future Roadmap
- [x] Web interface for browsing prompts ✅ **COMPLETED**
- [x] Prompt comparison and diff tools ✅ **COMPLETED**
- [ ] Community ratings and reviews
- [ ] API for programmatic access
- [ ] More individual tool READMEs
- [ ] Automated version tracking

> Open an issue for feature requests or bug reports.

> **Latest Update:** 15/11/2025

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
