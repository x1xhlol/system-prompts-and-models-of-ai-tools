import { AITool, ToolIndex } from './types'
import indexData from '../data/index.json'

export function getToolIndex(): ToolIndex {
  return indexData as ToolIndex
}

export function getAllTools(): AITool[] {
  const index = getToolIndex()
  return index.tools
}

export function getToolByDirectory(directory: string): AITool | undefined {
  const tools = getAllTools()
  return tools.find(tool => tool.directory === directory)
}

export function getToolsByCategory(category: string): AITool[] {
  const tools = getAllTools()
  return tools.filter(tool => tool.category === category)
}

export function getToolsByCompany(company: string): AITool[] {
  const tools = getAllTools()
  return tools.filter(tool => tool.company === company)
}

export function searchTools(query: string): AITool[] {
  if (!query) return getAllTools()

  const lowercaseQuery = query.toLowerCase()
  const tools = getAllTools()

  return tools.filter(tool => {
    return (
      tool.name.toLowerCase().includes(lowercaseQuery) ||
      tool.description.toLowerCase().includes(lowercaseQuery) ||
      tool.company.toLowerCase().includes(lowercaseQuery) ||
      tool.category.toLowerCase().includes(lowercaseQuery) ||
      tool.models.some(model => model.toLowerCase().includes(lowercaseQuery))
    )
  })
}

export function getCategories(): string[] {
  const index = getToolIndex()
  return Object.keys(index.stats.by_category).sort()
}

export function getCompanies(): string[] {
  const tools = getAllTools()
  const companies = new Set(tools.map(tool => tool.company))
  return Array.from(companies).sort()
}

export function getModels(): string[] {
  const tools = getAllTools()
  const models = new Set<string>()
  tools.forEach(tool => {
    tool.models.forEach(model => models.add(model))
  })
  return Array.from(models).sort()
}

export function getStats() {
  const index = getToolIndex()
  return index.stats
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Code Assistant': '💻',
    'IDE': '🏢',
    'AI Agent': '🤖',
    'Web Builder': '🌐',
    'Terminal': '🖥️',
    'Cloud IDE': '🏭',
    'Document Assistant': '📝',
    'Search Assistant': '🔍',
    'Foundation Model': '🧠',
    'Collection': '📚',
    'Unknown': '❓',
  }
  return icons[category] || '📦'
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Code Assistant': 'from-blue-500 to-cyan-500',
    'IDE': 'from-purple-500 to-pink-500',
    'AI Agent': 'from-green-500 to-emerald-500',
    'Web Builder': 'from-orange-500 to-red-500',
    'Terminal': 'from-gray-500 to-slate-500',
    'Cloud IDE': 'from-indigo-500 to-blue-500',
    'Document Assistant': 'from-yellow-500 to-orange-500',
    'Search Assistant': 'from-pink-500 to-rose-500',
    'Foundation Model': 'from-violet-500 to-purple-500',
    'Collection': 'from-teal-500 to-cyan-500',
  }
  return colors[category] || 'from-gray-500 to-slate-500'
}
