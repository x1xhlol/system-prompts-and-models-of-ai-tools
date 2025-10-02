# System Prompts Site Generator

This directory contains a static site generator for the System Prompts repository.

## Quick Start

```bash
# Build the site
npm run build

# Preview locally
npm run preview

# Development mode (build + preview)
npm run dev
```

## Features

- 🔍 Scans the repository for `.txt`, `.json`, and `.md` files
- 📄 Generates individual pages for each file with syntax highlighting
- 📊 Creates an organized index page with statistics
- 🎨 GitHub-inspired dark theme
- 📱 Responsive design

## Project Structure

```
site/
├── package.json       # Project dependencies and scripts
├── build.js           # Static site generator
├── .gitignore         # Git ignore rules
├── README.md          # This file
└── dist/              # Generated site (created on build)
    ├── index.html     # Main index page
    └── files/         # Individual file pages
```

## How It Works

1. **Scanning**: The build script recursively scans the parent directory for relevant files
2. **Processing**: Each file is processed and converted to an HTML page
3. **Generation**: An index page is created with the directory structure
4. **Output**: All files are written to the `dist/` directory

## Configuration

The build script can be customized by editing `build.js`:

- **EXCLUDED_DIRS**: Directories to skip during scanning
- **INCLUDED_EXTENSIONS**: File extensions to include
- **Styling**: Modify the embedded CSS in the HTML generation functions

## Deployment

The generated `dist/` directory can be deployed to:

- GitHub Pages
- Vercel
- Netlify
- Any static hosting service

See the main [INSTALL.md](../INSTALL.md) for detailed deployment instructions.
