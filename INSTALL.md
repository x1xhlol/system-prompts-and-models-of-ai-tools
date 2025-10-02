# Installation and Deployment Guide

## 📋 Prerequisites

- Node.js (version 18 or later)
- Git
- A GitHub account (for GitHub Pages deployment)

## 🚀 Quick Start

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sahiixx/system-prompts-and-models-of-ai-tools.git
   cd system-prompts-and-models-of-ai-tools
   ```

2. **Install dependencies:**
   ```bash
   cd site
   npm install
   ```

3. **Build the site:**
   ```bash
   npm run build
   ```

4. **Preview locally:**
   ```bash
   npm run preview
   ```
   The site will be available at `http://localhost:8000`

### Development Mode

For development with auto-rebuild:
```bash
npm run dev
```

## 🌐 Deployment Options

### GitHub Pages (Automatic)

The repository is configured for automatic deployment to GitHub Pages:

1. **Enable GitHub Pages:**
   - Go to your repository Settings → Pages
   - Set Source to "GitHub Actions"

2. **Trigger Deployment:**
   - Push to the `main` branch
   - Or manually trigger via Actions tab

3. **Access your site:**
   - Your site will be available at: `https://[username].github.io/system-prompts-and-models-of-ai-tools/`

### Manual Deployment

#### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd site
   npm run build
   vercel --prod
   ```

#### Deploy to Netlify

1. Build the site:
   ```bash
   cd site
   npm run build
   ```

2. Upload the `dist` folder to Netlify or connect your GitHub repository

#### Deploy to any static host

1. Build the site:
   ```bash
   npm run build
   ```

2. Upload the contents of `site/dist` to your web server

## 🔧 Configuration

### Environment Variables

- `BASE_PATH`: Set the base path for deployment (default: `/`)
  ```bash
  BASE_PATH=/my-subfolder/ npm run build
  ```

### Custom Styling

The build script includes embedded CSS. To customize:

1. Edit the `generateHTML` function in `site/build.js`
2. Modify the `<style>` section
3. Rebuild the site

## 📁 Project Structure

```
site/
├── package.json          # Dependencies and scripts
├── build.js              # Static site generator
├── dist/                 # Generated site (ignored by git)
│   ├── index.html        # Main page
│   └── files/            # Individual file pages
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## 🛠 Build Process

The build script (`build.js`) does the following:

1. **Scans the repository** for `.json` and `.md` files
2. **Generates an index page** with directory structure
3. **Creates individual pages** for each file with syntax highlighting
4. **Outputs everything** to the `dist/` directory

## 🐛 Troubleshooting

### Build Fails

- Ensure Node.js is installed: `node --version`
- Check if all files are readable
- Verify no corrupt JSON files exist

### Deployment Issues

- Check that `site/dist` directory exists after build
- Verify GitHub Pages is enabled in repository settings
- Check GitHub Actions logs for deployment errors

### Local Preview Issues

- Ensure Python is installed for `python -m http.server`
- Try alternative: `npx serve dist` (requires `serve` package)

## 🔄 Maintenance

### Adding New Content

1. Add your `.json` or `.md` files to any directory
2. Run `npm run build` to regenerate the site
3. Deploy using your preferred method

### Updating the Site

1. Modify `build.js` for layout changes
2. Update `package.json` for dependency changes
3. Rebuild and redeploy

## 📞 Support

- **Issues**: Open an issue on GitHub
- **Discord**: Join the community server
- **Documentation**: Check the main README.md

---

🎉 **Congratulations!** Your System Prompts repository is now ready for installation and deployment.