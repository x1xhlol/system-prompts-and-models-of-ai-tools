'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { getToolByDirectory } from '@/lib/data'
import { formatNumber, formatBytes } from '@/lib/utils'
import { X, FileText, Code, Package } from 'lucide-react'
import Link from 'next/link'

export default function ComparePage() {
  const { comparison, removeFromComparison, clearComparison } = useAppStore()

  const tools = comparison.map((dir) => getToolByDirectory(dir)).filter(Boolean)

  if (tools.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center max-w-2xl mx-auto">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Tools Selected</h2>
          <p className="text-muted-foreground mb-6">
            Add tools to comparison from the browse page to see side-by-side comparison
          </p>
          <Button asChild>
            <Link href="/browse">Browse Tools</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const comparisonData = [
    {
      label: 'Company',
      getValue: (tool: any) => tool.company,
    },
    {
      label: 'Category',
      getValue: (tool: any) => tool.category,
    },
    {
      label: 'Type',
      getValue: (tool: any) => <Badge variant="outline">{tool.type}</Badge>,
    },
    {
      label: 'Files',
      getValue: (tool: any) => tool.file_count,
    },
    {
      label: 'Total Lines',
      getValue: (tool: any) => formatNumber(tool.total_lines),
    },
    {
      label: 'Models',
      getValue: (tool: any) => (
        <div className="flex flex-wrap gap-1">
          {tool.models.length > 0 ? (
            tool.models.slice(0, 3).map((model: string) => (
              <Badge key={model} variant="secondary" className="text-xs">
                {model}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">None specified</span>
          )}
        </div>
      ),
    },
    {
      label: 'Website',
      getValue: (tool: any) =>
        tool.website ? (
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline text-sm"
          >
            Visit
          </a>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        ),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">Compare Tools</h1>
          {tools.length > 0 && (
            <Button variant="outline" onClick={clearComparison}>
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
        <p className="text-lg text-muted-foreground">
          Comparing {tools.length} of 4 maximum tools
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="grid" style={{ gridTemplateColumns: `200px repeat(${tools.length}, 1fr)` }}>
            {/* Header Row */}
            <div className="bg-muted p-4 border font-semibold">Tool</div>
            {tools.map((tool) => (
              <Card key={tool!.directory} className="border-l-0 rounded-none">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2">{tool!.name}</CardTitle>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFromComparison(tool!.directory)}
                      className="h-6 w-6 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}

            {/* Description Row */}
            <div className="bg-muted p-4 border border-t-0 font-semibold">Description</div>
            {tools.map((tool) => (
              <div key={`desc-${tool!.directory}`} className="p-4 border border-l-0 border-t-0">
                <p className="text-sm text-muted-foreground line-clamp-3">{tool!.description}</p>
              </div>
            ))}

            {/* Comparison Rows */}
            {comparisonData.map((row, index) => (
              <div key={row.label} className="contents">
                <div className="bg-muted p-4 border border-t-0 font-semibold text-sm">
                  {row.label}
                </div>
                {tools.map((tool) => (
                  <div key={`${row.label}-${tool!.directory}`} className="p-4 border border-l-0 border-t-0">
                    <div className="text-sm">{row.getValue(tool)}</div>
                  </div>
                ))}
              </div>
            ))}

            {/* Files Row */}
            <div className="bg-muted p-4 border border-t-0 font-semibold text-sm">Files</div>
            {tools.map((tool) => (
              <div key={`files-${tool!.directory}`} className="p-4 border border-l-0 border-t-0">
                <div className="space-y-1">
                  {tool!.files.slice(0, 5).map((file) => (
                    <div key={file.path} className="text-xs text-muted-foreground truncate">
                      <FileText className="w-3 h-3 inline mr-1" />
                      {file.name}
                    </div>
                  ))}
                  {tool!.files.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      +{tool!.files.length - 5} more files
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Actions Row */}
            <div className="bg-muted p-4 border border-t-0 font-semibold">Actions</div>
            {tools.map((tool) => (
              <div key={`actions-${tool!.directory}`} className="p-4 border border-l-0 border-t-0">
                <Button asChild size="sm" className="w-full">
                  <Link href={`/tool/${tool!.directory.toLowerCase().replace(/\s+/g, '-')}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add More */}
      {tools.length < 4 && (
        <Card className="mt-8 p-6 text-center">
          <p className="text-muted-foreground mb-4">
            You can compare up to {4 - tools.length} more tool{tools.length < 3 ? 's' : ''}
          </p>
          <Button asChild variant="outline">
            <Link href="/browse">Add More Tools</Link>
          </Button>
        </Card>
      )}
    </div>
  )
}
