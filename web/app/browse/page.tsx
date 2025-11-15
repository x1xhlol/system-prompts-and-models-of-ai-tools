'use client'

import { useState, useMemo } from 'react'
import { Filter, Grid, List, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ToolCard } from '@/components/tool-card'
import { getAllTools, getCategories, getCompanies, getModels } from '@/lib/data'
import { useAppStore } from '@/lib/store'
import { AITool } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function BrowsePage() {
  const tools = getAllTools()
  const categories = getCategories()
  const companies = getCompanies()
  const models = getModels()

  const { viewMode, setViewMode } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Filter tools
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.company.toLowerCase().includes(query) ||
          tool.category.toLowerCase().includes(query) ||
          tool.models.some((m) => m.toLowerCase().includes(query))

        if (!matchesSearch) return false
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(tool.category)) {
        return false
      }

      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(tool.type)) {
        return false
      }

      // Company filter
      if (selectedCompanies.length > 0 && !selectedCompanies.includes(tool.company)) {
        return false
      }

      return true
    })
  }, [tools, searchQuery, selectedCategories, selectedTypes, selectedCompanies])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const toggleCompany = (company: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedTypes([])
    setSelectedCompanies([])
  }

  const hasActiveFilters =
    searchQuery || selectedCategories.length > 0 || selectedTypes.length > 0 || selectedCompanies.length > 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Browse AI Tools</h1>
        <p className="text-lg text-muted-foreground">
          Explore {tools.length} AI coding tools and their system prompts
        </p>
      </div>

      {/* Search and Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="search"
            placeholder="Search tools, companies, models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="destructive" className="ml-2">
                  {[selectedCategories, selectedTypes, selectedCompanies]
                    .reduce((acc, arr) => acc + arr.length, 0)}
                </Badge>
              )}
            </Button>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedCategories.map((cat) => (
              <Badge key={cat} variant="secondary" className="gap-1">
                {cat}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleCategory(cat)} />
              </Badge>
            ))}
            {selectedTypes.map((type) => (
              <Badge key={type} variant="secondary" className="gap-1">
                {type}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleType(type)} />
              </Badge>
            ))}
            {selectedCompanies.map((company) => (
              <Badge key={company} variant="secondary" className="gap-1">
                {company}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleCompany(company)} />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Filters Sidebar */}
      {showFilters && (
        <Card className="mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.slice(0, 8).map((category) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="rounded"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Types */}
            <div>
              <h3 className="font-semibold mb-3">Type</h3>
              <div className="space-y-2">
                {['proprietary', 'open-source'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleType(type)}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Companies */}
            <div>
              <h3 className="font-semibold mb-3">Companies</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {companies.slice(0, 10).map((company) => (
                  <label key={company} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company)}
                      onChange={() => toggleCompany(company)}
                      className="rounded"
                    />
                    <span className="text-sm">{company}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTools.length} of {tools.length} tools
        </p>
      </div>

      {/* Tools Grid/List */}
      {filteredTools.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
          )}
        >
          {filteredTools.map((tool) => (
            <ToolCard key={tool.directory} tool={tool} variant={viewMode === 'list' ? 'compact' : 'default'} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">No tools found matching your criteria</p>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </Card>
      )}
    </div>
  )
}
