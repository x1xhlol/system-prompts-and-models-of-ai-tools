import Link from 'next/link'
import { Github, Heart, ExternalLink } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">AI Prompts Explorer</h3>
            <p className="text-sm text-muted-foreground">
              The most comprehensive collection of AI tool system prompts and configurations.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-foreground transition-colors">
                  Browse Tools
                </Link>
              </li>
              <li>
                <Link href="/stats" className="hover:text-foreground transition-colors">
                  Statistics
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-foreground transition-colors">
                  Compare Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Contributing
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools/blob/main/CHANGELOG.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Changelog
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/NwzrWErdMU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Discord
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <h3 className="font-semibold">Repository Stats</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>32+ AI Tools</li>
              <li>96 Files</li>
              <li>20,000+ Lines</li>
              <li>11 Categories</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1 flex-wrap">
            Built with <Heart className="w-4 h-4 text-red-500 fill-red-500 inline" /> by the community
            <span className="mx-1">•</span>
            © {currentYear} AI Prompts Explorer
          </p>
        </div>
      </div>
    </footer>
  )
}
