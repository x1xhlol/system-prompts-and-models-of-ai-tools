'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAllTools, getStats, getCategoryIcon, getCategoryColor } from '@/lib/data'
import { formatNumber } from '@/lib/utils'
import { BarChart3, TrendingUp, Package, FileText, Code } from 'lucide-react'

export default function StatsPage() {
  const stats = getStats()
  const tools = getAllTools()

  // Calculate additional stats
  const topByLines = [...tools].sort((a, b) => b.total_lines - a.total_lines).slice(0, 10)
  const topByFiles = [...tools].sort((a, b) => b.file_count - a.file_count).slice(0, 10)

  // Get max values for scaling
  const maxByCategory = Math.max(...Object.values(stats.by_category))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Statistics & Analytics</h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive insights into AI tools and their configurations
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total AI Tools</CardDescription>
            <CardTitle className="text-4xl">{stats.total_tools}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Across {Object.keys(stats.by_category).length} categories
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Files</CardDescription>
            <CardTitle className="text-4xl">{stats.total_files}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Configuration & prompt files
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Lines</CardDescription>
            <CardTitle className="text-4xl">{formatNumber(stats.total_lines)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Code className="w-3 h-3" />
              Of system prompts & configs
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average per Tool</CardDescription>
            <CardTitle className="text-4xl">
              {Math.round(stats.total_lines / stats.total_tools)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Lines per tool
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tools by Category</CardTitle>
          <CardDescription>Distribution across all categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.by_category)
              .sort(([, a], [, b]) => b - a)
              .map(([category, count]) => {
                const percentage = (count / maxByCategory) * 100
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(category)}</span>
                        <span className="font-medium">{category}</span>
                      </div>
                      <Badge variant="secondary">{count} tools</Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getCategoryColor(category)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Top by Lines */}
        <Card>
          <CardHeader>
            <CardTitle>Most Complex (by lines)</CardTitle>
            <CardDescription>Tools with the most lines of code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topByLines.map((tool, index) => (
                <div key={tool.directory} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 text-center font-bold text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{tool.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{tool.company}</div>
                  </div>
                  <Badge variant="outline">{formatNumber(tool.total_lines)} lines</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top by Files */}
        <Card>
          <CardHeader>
            <CardTitle>Most Files</CardTitle>
            <CardDescription>Tools with the most configuration files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topByFiles.map((tool, index) => (
                <div key={tool.directory} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 text-center font-bold text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{tool.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{tool.company}</div>
                  </div>
                  <Badge variant="outline">{tool.file_count} files</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Open Source vs Proprietary</CardTitle>
          <CardDescription>Distribution by tool type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.by_type).map(([type, count]) => {
              const percentage = (count / stats.total_tools) * 100
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{type}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{count} tools</Badge>
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        type === 'open-source'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
