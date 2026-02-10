"use client"

import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { Github, Twitter, Send } from "lucide-react"
import { Logo } from "@/components/logo"
import { AvatarCircles } from "@/components/ui/avatar-circles"

interface Contributor {
  id: number
  login: string
  avatar_url: string
  html_url: string
}

export function Footer() {
  const [contributors, setContributors] = useState<Contributor[]>([])

  useEffect(() => {
    fetch('https://api.github.com/repos/puri-adityakumar/astraa/contributors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setContributors(data)
        }
      })
      .catch(() => {
        // Silent fail - avatar will show default
      })
  }, [])

  // Transform contributors for AvatarCircles
  const avatarUrls = useMemo(() => {
    if (contributors.length > 0) {
      return contributors.slice(0, 5).map((c) => ({
        imageUrl: c.avatar_url,
        profileUrl: c.html_url,
      }))
    }
    return [{
      imageUrl: "https://github.com/puri-adityakumar.png",
      profileUrl: "https://github.com/puri-adityakumar",
    }]
  }, [contributors])

  // Calculate remaining contributors count
  const remainingCount = contributors.length > 5 ? contributors.length - 5 : 0

  return (
    <footer className="relative z-10 bg-gradient-to-b from-transparent via-background/40 to-background w-full">
      <div className="container px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-12">
          {/* Left Section */}
          <div className="space-y-3 max-w-md">
            <div className="-ml-1">
              <Logo className="text-3xl md:text-4xl [&>span:last-child]:text-base md:[&>span:last-child]:text-xl" />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A collection of helpful utility tools for developers and creators,
              built with modern web technologies. Designed for speed,
              accessibility, and ease of use.
            </p>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">Contributed by:</span>
              <AvatarCircles
                avatarUrls={avatarUrls}
                numPeople={remainingCount}
              />
            </div>
          </div>

          {/* Right Section - Left aligned on mobile, right aligned on desktop */}
          <div className="flex flex-col gap-2 md:gap-3 items-center md:items-end md:justify-end">
            {/* Social Icons */}
            <div className="flex items-center gap-1 md:gap-5">
              <Link
                href="https://github.com/puri-adityakumar/astraa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://x.com/astraadottech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="https://t.me/astraadottech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Telegram"
              >
                <Send className="h-5 w-5" />
              </Link>
            </div>

            {/* Text Links */}
            <div className="flex items-center gap-4 md:gap-6 text-sm text-muted-foreground">


              <Link
                href="https://astraa.notion.site/roadmap"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Roadmap
              </Link>
              <Link
                href="https://astraa.notion.site/roadmap"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Docs
              </Link>
              <Link
                href="https://astraa.notion.site/changelog"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Changelog
              </Link>
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 pt-4 border-t border-white/5 flex justify-center md:justify-start">
          <p className="text-xs md:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Astraa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}