export interface AITool {
  name: string
  company: string
  category: string
  type: 'proprietary' | 'open-source' | 'unknown'
  description: string
  website: string | null
  models: string[]
  directory: string
  files: ToolFile[]
  file_count: number
  total_lines: number
  subcategories?: string[]
}

export interface ToolFile {
  name: string
  path: string
  size: number
  type: string
  lines?: number
  modified?: string
}

export interface ToolIndex {
  generated: string
  repository: string
  version: string
  stats: {
    total_tools: number
    total_files: number
    total_lines: number
    by_category: Record<string, number>
    by_type: Record<string, number>
  }
  tools: AITool[]
}

export type Category =
  | 'Code Assistant'
  | 'IDE'
  | 'AI Agent'
  | 'Web Builder'
  | 'Terminal'
  | 'Cloud IDE'
  | 'Document Assistant'
  | 'Search Assistant'
  | 'Foundation Model'
  | 'Collection'
  | 'Unknown'

export interface FilterState {
  search: string
  categories: Category[]
  types: ('proprietary' | 'open-source')[]
  companies: string[]
  models: string[]
  sortBy: 'name' | 'lines' | 'files' | 'company'
  sortOrder: 'asc' | 'desc'
}
