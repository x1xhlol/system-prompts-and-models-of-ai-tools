import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Search, BarChart3, GitCompare, Sparkles, Code, Zap, Shield } from 'lucide-react'
import { getAllTools, getStats, getCategories } from '@/lib/data'
import { formatNumber } from '@/lib/utils'
import { ToolCard } from '@/components/tool-card'

export default function HomePage() {
  const stats = getStats()
  const tools = getAllTools()
  const categories = getCategories()
  const featuredTools = tools.slice(0, 6)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center space-y-8 animate-fade-in">
            <Badge className="mx-auto" variant="secondary">
              <Sparkles className="w-3 h-3 mr-1" />
              Version 2.0 - Now with Web Interface!
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              <span className="block">Explore AI Tool</span>
              <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                System Prompts
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              The most comprehensive collection of AI coding tool system prompts and configurations.
              Discover how {stats.total_tools}+ AI tools work under the hood.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="text-lg h-12 px-8">
                <Link href="/browse">
                  Browse All Tools
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg h-12 px-8">
                <Link href="/stats">
                  View Statistics
                  <BarChart3 className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              <div className="bg-card border rounded-lg p-4">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  {stats.total_tools}+
                </div>
                <div className="text-sm text-muted-foreground">AI Tools</div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {stats.total_files}
                </div>
                <div className="text-sm text-muted-foreground">Files</div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  {formatNumber(stats.total_lines)}
                </div>
                <div className="text-sm text-muted-foreground">Lines</div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  {categories.length}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why AI Prompts Explorer?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover, compare, and understand AI tool system prompts
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <Search className="w-10 h-10 text-blue-500 mb-2" />
              <CardTitle>Advanced Search</CardTitle>
              <CardDescription>
                Search and filter by category, company, model, or keyword
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <GitCompare className="w-10 h-10 text-purple-500 mb-2" />
              <CardTitle>Tool Comparison</CardTitle>
              <CardDescription>
                Compare up to 4 tools side-by-side to see differences
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-green-500 mb-2" />
              <CardTitle>Analytics & Stats</CardTitle>
              <CardDescription>
                Visualize trends and statistics across all AI tools
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <Code className="w-10 h-10 text-orange-500 mb-2" />
              <CardTitle>Complete Prompts</CardTitle>
              <CardDescription>
                Full system prompts and tool configurations included
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <Zap className="w-10 h-10 text-indigo-500 mb-2" />
              <CardTitle>Regular Updates</CardTitle>
              <CardDescription>
                New tools and updates added regularly from the community
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-pink-200 dark:border-pink-800">
            <CardHeader>
              <Shield className="w-10 h-10 text-pink-500 mb-2" />
              <CardTitle>Open Source</CardTitle>
              <CardDescription>
                Fully open source with community contributions welcome
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Featured AI Tools
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore some of the most popular AI coding tools and their system prompts
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.directory} tool={tool} />
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/browse">
                View All {stats.total_tools} Tools
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Explore AI Prompts?
            </h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              Start browsing our collection of {stats.total_tools}+ AI tools and discover how they work
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                <Link href="/browse">
                  Start Exploring
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <a href="https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools" target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
