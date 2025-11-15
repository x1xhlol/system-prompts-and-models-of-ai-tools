# AI Prompts Explorer - Web Interface

A modern, responsive web application for exploring AI tool system prompts and configurations. Built with Next.js 15, React 19, and TypeScript.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)

## ✨ Features

- 🔍 **Advanced Search & Filtering** - Search by name, company, category, or model
- 📊 **Statistics Dashboard** - Comprehensive analytics and visualizations
- 🔄 **Tool Comparison** - Compare up to 4 tools side-by-side
- 💾 **Favorites** - Save your favorite tools for quick access
- 🎨 **Dark Mode** - Beautiful dark/light theme support
- 📱 **Fully Responsive** - Perfect on desktop, tablet, and mobile
- ⚡ **Lightning Fast** - Built with Next.js 15 and Server Components
- 🎭 **Smooth Animations** - Polished UX with Framer Motion

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ (recommended: 22.21.1)
- npm 10+

### Installation

```bash
# Navigate to the web directory
cd web

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
web/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── browse/            # Browse tools page
│   ├── stats/             # Statistics dashboard
│   ├── compare/           # Tool comparison
│   ├── tool/[slug]/       # Individual tool pages
│   ├── about/             # About page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── navbar.tsx        # Navigation bar
│   ├── footer.tsx        # Footer
│   ├── tool-card.tsx     # Tool card component
│   └── theme-provider.tsx # Theme provider
├── lib/                   # Utilities and data
│   ├── data.ts           # Data loading functions
│   ├── store.ts          # Zustand state management
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
├── data/                  # Static data
│   └── index.json        # Generated metadata
└── public/               # Static assets
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)

## 📦 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

## 🎨 Features In Detail

### Browse Tools
- Grid or list view
- Real-time search
- Multi-select filters (category, type, company)
- Sort by name, lines, files, or company
- Responsive card layout

### Tool Detail Pages
- Complete tool information
- File listings with sizes
- Model information
- Direct links to GitHub and official websites
- Add to comparison or favorites

### Statistics Dashboard
- Total tools, files, and lines
- Category distribution with visual bars
- Top tools by complexity
- Type distribution (proprietary vs open-source)
- Company breakdown

### Comparison
- Side-by-side comparison of up to 4 tools
- Compare all key metrics
- File listings
- Quick actions

### Dark Mode
- System preference detection
- Manual toggle
- Persistent preference
- Smooth transitions

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file (optional):

```env
# No environment variables required for basic setup
```

### Updating Data

The app uses `data/index.json` generated from the repository metadata:

```bash
# From the repository root
python3 scripts/generate_metadata.py

# Copy to web/data
cp scripts/index.json web/data/
```

## 🚀 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools/tree/main/web)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

Build the static site:

```bash
npm run build
```

The output will be in `.next/`. Deploy using:
- **Netlify**: Supports Next.js
- **Cloudflare Pages**: Supports Next.js
- **AWS Amplify**: Supports Next.js
- **Docker**: Use the included Dockerfile (if created)

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Please see the main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the [AI Prompts and Models Repository](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) and follows the same license.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Community contributions

## 📞 Support

- 🐛 [Report Issues](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools/issues)
- 💬 [Discord Community](https://discord.gg/NwzrWErdMU)
- 📧 Email: lucknitelol@proton.me

## 🎯 Roadmap

- [ ] Advanced filtering (by model, file count, etc.)
- [ ] Export comparison as PDF/image
- [ ] Favorites synchronization
- [ ] Community ratings and reviews
- [ ] API for programmatic access
- [ ] Prompt visualization and analysis
- [ ] Search result highlighting
- [ ] Keyboard shortcuts

---

**Made with ❤️ by the AI Prompts Explorer community**
