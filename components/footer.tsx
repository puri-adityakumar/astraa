"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Github } from "lucide-react"
import { BsTwitterX, BsTelegram } from "react-icons/bs"
import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
      .catch(err => console.error('Failed to fetch contributors:', err))
  }, [])

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
              <div className="flex items-center -space-x-2">
                {contributors.length > 0 ? (
                  contributors.slice(0, 5).map((contributor) => (
                    <Link
                      key={contributor.id}
                      href={contributor.html_url}
                      target="_blank"
                      className="transition-transform hover:scale-110 hover:z-10 translate-y-0.5"
                    >
                      <Avatar className="h-7 w-7 md:h-8 md:w-8 border-2 border-background">
                        <AvatarImage src={contributor.avatar_url} alt={contributor.login} />
                        <AvatarFallback>{contributor.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Link>
                  ))
                ) : (
                  <Link
                    href="https://github.com/puri-adityakumar"
                    target="_blank"
                    className="transition-transform hover:scale-110 hover:z-10 translate-y-0.5"
                  >
                    <Avatar className="h-7 w-7 md:h-8 md:w-8 border-2 border-background">
                      <AvatarImage src="https://github.com/puri-adityakumar.png" alt="@puri-adityakumar" />
                      <AvatarFallback>AK</AvatarFallback>
                    </Avatar>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Left aligned on mobile, right aligned on desktop */}
          <div className="flex flex-col gap-3 items-start md:items-end md:justify-end">
            {/* Social Icons */}
            <div className="flex items-center gap-5">
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
                <BsTwitterX className="h-4 w-4" />
              </Link>
              <Link
                href="https://t.me/astraadottech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Telegram"
              >
                <BsTelegram className="h-5 w-5" />
              </Link>
            </div>

            {/* Text Links */}
            <div className="flex items-center gap-4 md:gap-6 text-sm text-muted-foreground">
              <Link
                href="/changelog"
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