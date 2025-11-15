import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Prompts Explorer - System Prompts & AI Tool Configurations',
  description: 'Explore 32+ AI coding tools, their system prompts, and configurations. The most comprehensive collection of AI tool prompts.',
  keywords: ['AI', 'prompts', 'system prompts', 'AI tools', 'LLM', 'GPT', 'Claude', 'code assistant'],
  authors: [{ name: 'AI Prompts Explorer' }],
  openGraph: {
    title: 'AI Prompts Explorer',
    description: 'Explore 32+ AI coding tools and their system prompts',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
