import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center">
      <Card className="p-12 text-center max-w-2xl">
        <div className="text-8xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/browse">
              <Search className="w-4 h-4 mr-2" />
              Browse Tools
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
