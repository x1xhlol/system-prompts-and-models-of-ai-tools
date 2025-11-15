import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AITool, FilterState } from './types'

interface AppState {
  // Favorites
  favorites: string[]
  addFavorite: (toolDirectory: string) => void
  removeFavorite: (toolDirectory: string) => void
  isFavorite: (toolDirectory: string) => boolean

  // Comparison
  comparison: string[]
  addToComparison: (toolDirectory: string) => void
  removeFromComparison: (toolDirectory: string) => void
  clearComparison: () => void
  isInComparison: (toolDirectory: string) => boolean

  // Filters
  filters: FilterState
  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void

  // View preferences
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
}

const defaultFilters: FilterState = {
  search: '',
  categories: [],
  types: [],
  companies: [],
  models: [],
  sortBy: 'name',
  sortOrder: 'asc',
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Favorites
      favorites: [],
      addFavorite: (toolDirectory) =>
        set((state) => ({
          favorites: [...state.favorites, toolDirectory],
        })),
      removeFavorite: (toolDirectory) =>
        set((state) => ({
          favorites: state.favorites.filter((dir) => dir !== toolDirectory),
        })),
      isFavorite: (toolDirectory) => get().favorites.includes(toolDirectory),

      // Comparison
      comparison: [],
      addToComparison: (toolDirectory) =>
        set((state) => {
          if (state.comparison.length >= 4) return state
          return { comparison: [...state.comparison, toolDirectory] }
        }),
      removeFromComparison: (toolDirectory) =>
        set((state) => ({
          comparison: state.comparison.filter((dir) => dir !== toolDirectory),
        })),
      clearComparison: () => set({ comparison: [] }),
      isInComparison: (toolDirectory) =>
        get().comparison.includes(toolDirectory),

      // Filters
      filters: defaultFilters,
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),

      // View preferences
      viewMode: 'grid',
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: 'ai-prompts-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        viewMode: state.viewMode,
      }),
    }
  )
)
