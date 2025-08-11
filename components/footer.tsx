"use client"

import Link from "next/link"
import { Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border py-6 md:py-8 mt-16 md:mt-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 md:gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors touch-manipulation p-2 -m-2"
              aria-label="Visit our GitHub repository"
            >
              <Github className="h-5 w-5 md:h-6 md:w-6" />
            </Link>
            <Link 
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors touch-manipulation p-2 -m-2"
              aria-label="Follow us on Twitter"
            >
              <Twitter className="h-5 w-5 md:h-6 md:w-6" />
            </Link>
          </div>
          
          <p className="text-xs md:text-sm text-muted-foreground text-center order-first md:order-none">
            Built with ❤️ by the community
          </p>
          
          <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
            <Link 
              href="/privacy" 
              className="hover:text-foreground transition-colors touch-manipulation py-2"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="hover:text-foreground transition-colors touch-manipulation py-2"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}