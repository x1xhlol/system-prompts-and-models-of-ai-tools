'use client'

import Link from 'next/link'
import { Heart, GitCompare, ExternalLink, FileText, Code } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AITool } from '@/lib/types'
import { getCategoryIcon, getCategoryColor } from '@/lib/data'
import { useAppStore } from '@/lib/store'
import { formatNumber, slugify } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ToolCardProps {
  tool: AITool
  variant?: 'default' | 'compact'
}

export function ToolCard({ tool, variant = 'default' }: ToolCardProps) {
  const { favorites, addFavorite, removeFavorite, isFavorite } = useAppStore()
  const { comparison, addToComparison, removeFromComparison, isInComparison } = useAppStore()

  const favorite = isFavorite(tool.directory)
  const inComparison = isInComparison(tool.directory)

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    if (favorite) {
      removeFavorite(tool.directory)
    } else {
      addFavorite(tool.directory)
    }
  }

  const toggleComparison = (e: React.MouseEvent) => {
    e.preventDefault()
    if (inComparison) {
      removeFromComparison(tool.directory)
    } else if (comparison.length < 4) {
      addToComparison(tool.directory)
    }
  }

  if (variant === 'compact') {
    return (
      <Link href={`/tool/${slugify(tool.directory)}`}>
        <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                  {tool.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-1 mt-1">
                  {tool.company}
                </CardDescription>
              </div>
              <div className={cn('text-2xl flex-shrink-0', getCategoryColor(tool.category))}>
                {getCategoryIcon(tool.category)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                {tool.category}
              </Badge>
              {tool.models.slice(0, 1).map((model) => (
                <Badge key={model} variant="outline" className="text-xs">
                  {model}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-all group">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-3xl">{getCategoryIcon(tool.category)}</div>
              <Badge variant="secondary">{tool.category}</Badge>
            </div>
            <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
              {tool.name}
            </CardTitle>
            <CardDescription className="line-clamp-1 mt-1">
              {tool.company}
            </CardDescription>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFavorite}
              className={cn('h-8 w-8', favorite && 'text-red-500')}
            >
              <Heart className={cn('w-4 h-4', favorite && 'fill-current')} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleComparison}
              className={cn('h-8 w-8', inComparison && 'text-blue-500')}
              disabled={!inComparison && comparison.length >= 4}
            >
              <GitCompare className={cn('w-4 h-4', inComparison && 'fill-current')} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {tool.description}
        </p>

        <div className="space-y-2">
          {/* Models */}
          {tool.models.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tool.models.slice(0, 3).map((model) => (
                <Badge key={model} variant="outline" className="text-xs">
                  {model}
                </Badge>
              ))}
              {tool.models.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tool.models.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {tool.file_count} files
            </div>
            <div className="flex items-center gap-1">
              <Code className="w-3 h-3" />
              {formatNumber(tool.total_lines)} lines
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/tool/${slugify(tool.directory)}`}>
            View Details
          </Link>
        </Button>
        {tool.website && (
          <Button asChild variant="outline" size="icon">
            <a href={tool.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
