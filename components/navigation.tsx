"use client"

import { Suspense, lazy } from "react"
import { Logo } from './logo'
import { ThemeToggle } from './theme/theme-toggle'
import Link from 'next/link'
import { Github } from 'lucide-react'
import { Button } from './ui/button'

// Lazy load CommandMenu for better initial load performance
const CommandMenu = lazy(() => import('./command-menu').then(mod => ({ default: mod.CommandMenu })))

export function Navigation() {
  return (
    <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-14 md:h-16 items-center justify-between">
          <Logo />

          <div className="flex-1 hidden md:flex justify-center px-4 max-w-2xl mx-auto">
            <Suspense fallback={
              <div className="h-9 w-64 bg-muted/50 rounded-md animate-pulse" />
            }>
              <CommandMenu />
            </Suspense>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm"
              asChild 
              className="hidden sm:inline-flex h-9 w-9 md:h-10 md:w-10 touch-manipulation"
            >
              <Link href="/contribute">
                <Github className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">Contribute on GitHub</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}