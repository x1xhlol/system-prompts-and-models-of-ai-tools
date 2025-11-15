'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Moon, Sun, Menu, X, Home, Grid, BarChart3, BookOpen, GitCompare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Browse', href: '/browse', icon: Grid },
  { name: 'Statistics', href: '/stats', icon: BarChart3 },
  { name: 'Compare', href: '/compare', icon: GitCompare },
  { name: 'About', href: '/about', icon: BookOpen },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { filters, setFilters } = useAppStore()
  const comparison = useAppStore((state) => state.comparison)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ search: searchQuery })
    if (pathname !== '/browse') {
      window.location.href = '/browse'
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
            </div>
            <span className="hidden sm:inline-block font-bold text-xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Prompts Explorer
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                  {item.name === 'Compare' && comparison.length > 0 && (
                    <span className="ml-1 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5">
                      {comparison.length}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search AI tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hidden sm:inline-flex"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4 animate-slide-down">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search AI tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <div className="space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                    {item.name === 'Compare' && comparison.length > 0 && (
                      <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">
                        {comparison.length}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Mobile Theme Toggle */}
            {mounted && (
              <div className="px-2 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-full justify-start"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="mr-2 h-5 w-5" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-5 w-5" />
                      Dark Mode
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
