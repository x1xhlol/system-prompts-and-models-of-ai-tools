import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Github, Heart, Code, Database, Search, BarChart3, GitCompare, Sparkles } from 'lucide-react'
import { getStats } from '@/lib/data'
import { formatNumber } from '@/lib/utils'

export default function AboutPage() {
  const stats = getStats()

  const features = [
    {
      icon: Search,
      title: 'Advanced Search',
      description: 'Search and filter by category, company, model, or keyword with real-time results',
    },
    {
      icon: GitCompare,
      title: 'Side-by-Side Comparison',
      description: 'Compare up to 4 tools simultaneously to analyze differences and similarities',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive statistics and visualizations of all AI tools',
    },
    {
      icon: Code,
      title: 'Complete Prompts',
      description: 'Full system prompts and tool configurations, not just excerpts',
    },
    {
      icon: Database,
      title: 'Structured Data',
      description: 'Organized metadata with files, models, categories, and companies',
    },
    {
      icon: Sparkles,
      title: 'Modern Interface',
      description: 'Beautiful, responsive UI built with Next.js 15, React 19, and Tailwind CSS',
    },
  ]

  const techStack = [
    { name: 'Next.js 15', description: 'React framework with App Router' },
    { name: 'React 19', description: 'Latest React with Server Components' },
    { name: 'TypeScript', description: 'Type-safe development' },
    { name: 'Tailwind CSS', description: 'Utility-first CSS framework' },
    { name: 'Zustand', description: 'Lightweight state management' },
    { name: 'Framer Motion', description: 'Animation library' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge className="mb-4" variant="secondary">
          <Sparkles className="w-3 h-3 mr-1" />
          Version 2.0
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          About AI Prompts Explorer
        </h1>
        <p className="text-lg text-muted-foreground">
          The most comprehensive, searchable collection of AI tool system prompts and configurations.
          Discover how {stats.total_tools}+ AI coding tools work under the hood.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4 mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{stats.total_tools}+</CardTitle>
            <CardDescription>AI Tools Documented</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{stats.total_files}</CardTitle>
            <CardDescription>Configuration Files</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{formatNumber(stats.total_lines)}</CardTitle>
            <CardDescription>Lines of Prompts</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{Object.keys(stats.by_category).length}</CardTitle>
            <CardDescription>Tool Categories</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Features */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <Icon className="w-10 h-10 mb-2 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Technology Stack</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {techStack.map((tech) => (
            <Card key={tech.name}>
              <CardHeader>
                <CardTitle className="text-lg">{tech.name}</CardTitle>
                <CardDescription>{tech.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Mission */}
      <Card className="mb-16">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-4">
            AI Prompts Explorer aims to provide transparency into how AI coding tools work by collecting,
            organizing, and presenting their system prompts and configurations in an accessible way.
          </p>
          <p className="text-muted-foreground mb-4">
            We believe that understanding how AI tools are configured helps developers:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li>Choose the right tools for their needs</li>
            <li>Learn prompt engineering best practices</li>
            <li>Understand AI tool capabilities and limitations</li>
            <li>Build better AI-powered applications</li>
            <li>Contribute to the open-source AI community</li>
          </ul>
        </CardContent>
      </Card>

      {/* Contributing */}
      <Card className="mb-16">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <Heart className="w-12 h-12 text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">Contributing</h2>
              <p className="text-muted-foreground mb-4">
                This project is open source and welcomes contributions from the community. You can help by:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                <li>Adding new AI tool prompts and configurations</li>
                <li>Updating existing tool information</li>
                <li>Improving documentation</li>
                <li>Reporting bugs or suggesting features</li>
                <li>Sharing the project with others</li>
              </ul>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <a
                    href="https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    View on GitHub
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a
                    href="https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools/blob/main/CONTRIBUTING.md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contributing Guide
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white border-0">
        <CardContent className="p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Exploring</h2>
          <p className="text-lg mb-6 text-white/90">
            Browse {stats.total_tools}+ AI tools and discover their system prompts
          </p>
          <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-white/90">
            <Link href="/browse">Browse All Tools</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
