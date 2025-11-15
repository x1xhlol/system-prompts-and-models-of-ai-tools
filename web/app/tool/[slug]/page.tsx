import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, FileText, Code, Calendar, GitCompare, Heart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getAllTools, getCategoryIcon, getCategoryColor } from '@/lib/data'
import { formatNumber, formatBytes, slugify } from '@/lib/utils'

export async function generateStaticParams() {
  const tools = getAllTools()
  return tools.map((tool) => ({
    slug: slugify(tool.directory),
  }))
}

export default function ToolDetailPage({ params }: { params: { slug: string } }) {
  const tools = getAllTools()
  const tool = tools.find((t) => slugify(t.directory) === params.slug)

  if (!tool) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/browse">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-5xl">{getCategoryIcon(tool.category)}</div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-4xl font-bold">{tool.name}</h1>
              <Badge variant="secondary">{tool.category}</Badge>
              <Badge variant="outline">{tool.type}</Badge>
            </div>
            <p className="text-xl text-muted-foreground mb-4">{tool.company}</p>
            <p className="text-lg">{tool.description}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Files</CardDescription>
              <CardTitle className="text-2xl">{tool.file_count}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Lines</CardDescription>
              <CardTitle className="text-2xl">{formatNumber(tool.total_lines)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Models</CardDescription>
              <CardTitle className="text-2xl">{tool.models.length || '-'}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Category</CardDescription>
              <CardTitle className="text-xl truncate">{tool.category}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Configuration Files
              </CardTitle>
              <CardDescription>
                {tool.file_count} files containing system prompts and configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tool.files.map((file) => (
                  <div
                    key={file.path}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatBytes(file.size)}
                        {file.lines && ` • ${formatNumber(file.lines)} lines`}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {file.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Models */}
          {tool.models.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  AI Models
                </CardTitle>
                <CardDescription>Models used or supported by this tool</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tool.models.map((model) => (
                    <Badge key={model} variant="secondary" className="text-sm">
                      {model}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subcategories */}
          {tool.subcategories && tool.subcategories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Tools</CardTitle>
                <CardDescription>Other tools in this collection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tool.subcategories.map((sub) => (
                    <Badge key={sub} variant="outline">
                      {sub}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tool.website && (
                <Button asChild className="w-full">
                  <a href={tool.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              )}
              <Button variant="outline" className="w-full">
                <a
                  href={`https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools/tree/main/${encodeURIComponent(
                    tool.directory
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View on GitHub
                </a>
              </Button>
              <Button variant="outline" className="w-full">
                <GitCompare className="w-4 h-4 mr-2" />
                Add to Compare
              </Button>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Company</div>
                <div className="font-medium">{tool.company}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Category</div>
                <div className="font-medium">{tool.category}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Type</div>
                <Badge variant="outline" className="capitalize">
                  {tool.type}
                </Badge>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Total Size</div>
                <div className="font-medium">
                  {formatBytes(tool.files.reduce((acc, f) => acc + f.size, 0))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
