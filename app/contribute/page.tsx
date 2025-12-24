"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Github, Bug } from "lucide-react"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Contributor {
  id: number
  login: string
  avatar_url: string
  html_url: string
  contributions: number
}

export default function ContributePage() {
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
    <div className="container max-w-5xl pt-24 pb-12 space-y-16">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Contribute to <span style={{ fontFamily: "'Funnel Display', sans-serif" }}>astraa</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Built by developers, for developers. Help us shape the future of this open-source collection of tools.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="https://github.com/puri-adityakumar/astraa" target="_blank">
              <Github className="mr-2 h-5 w-5" />
              Star on GitHub
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8">
            <Link href="https://github.com/puri-adityakumar/astraa/issues" target="_blank">
              <Bug className="mr-2 h-5 w-5" />
              Report Issue
            </Link>
          </Button>
        </div>

        <div className="pt-8 max-w-xl mx-auto space-y-6">
          <blockquote className="font-mono text-sm sm:text-base text-muted-foreground leading-relaxed italic">
            "This was my first idea when I started coding. I wanted to build this, but back then I didn't have the skills. Now I do, so I made it happen."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="text-right leading-tight">
              <span className="text-sm font-semibold block">~ Aditya</span>
              <span className="text-xs text-muted-foreground block">Founder</span>
            </div>
            <Link href="https://github.com/puri-adityakumar" target="_blank" className="flex-shrink-0 hover:opacity-80 transition-opacity">
              <img
                src="https://github.com/puri-adityakumar.png"
                alt="Aditya"
                className="w-10 h-10 rounded-full border border-border bg-muted"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Top Contributors Section */}
      <div className="space-y-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          Top Contributors
        </h2>

        {contributors.length > 0 ? (
          <div className="flex flex-col items-center gap-6">
            {/* Overlapping Avatars */}
            <div className="flex items-center justify-center">
              <div className="flex -space-x-4">
                {contributors.slice(0, 4).map((contributor) => (
                  <Link
                    key={contributor.id}
                    href={contributor.html_url}
                    target="_blank"
                    className="transition-transform hover:scale-110 hover:z-10 relative"
                  >
                    <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-4 border-background shadow-lg">
                      <AvatarImage src={contributor.avatar_url} alt={contributor.login} />
                      <AvatarFallback>{contributor.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>
                ))}
                {contributors.length > 4 && (
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-foreground text-background border-4 border-background shadow-lg flex items-center justify-center font-semibold text-sm sm:text-base">
                    +{contributors.length - 4}
                  </div>
                )}
              </div>
            </div>

            {/* Contributor Names */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {contributors.slice(0, 5).map((contributor, index) => (
                <Link
                  key={contributor.id}
                  href={contributor.html_url}
                  target="_blank"
                  className="hover:text-foreground transition-colors"
                >
                  {contributor.login}
                  {index < Math.min(contributors.length, 5) - 1 && <span className="ml-6 text-border">•</span>}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No contributors yet. Be the first to contribute!
          </p>
        )}
      </div>

      {/* Getting Started Section */}
      <div className="space-y-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          Getting Started
        </h2>

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              1
            </div>
            <div>
              <p className="font-medium">Star the repository</p>
              <p className="text-sm text-muted-foreground">Show your support and help us reach more developers.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              2
            </div>
            <div>
              <p className="font-medium">Read CONTRIBUTING.md & Code of Conduct</p>
              <p className="text-sm text-muted-foreground">
                Understand our{" "}
                <Link href="https://github.com/puri-adityakumar/astraa/blob/main/CONTRIBUTING.md" target="_blank" className="text-foreground hover:underline">
                  contribution guidelines
                </Link>
                {" "}and{" "}
                <Link href="https://github.com/puri-adityakumar/astraa/blob/main/CODE_OF_CONDUCT.md" target="_blank" className="text-foreground hover:underline">
                  code of conduct
                </Link>
                {" "}before contributing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              3
            </div>
            <div>
              <p className="font-medium">Check the Issues tab or raise a new issue</p>
              <p className="text-sm text-muted-foreground">Find tasks to work on or report bugs and feature requests.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              4
            </div>
            <div>
              <p className="font-medium">Reach out to us</p>
              <p className="text-sm text-muted-foreground">
                Connect with us on{" "}
                <Link href="https://x.com/astraadottech" target="_blank" className="text-foreground hover:underline">
                  X (formerly Twitter)
                </Link>
                {" "}or{" "}
                <Link href="https://t.me/astraadottech" target="_blank" className="text-foreground hover:underline">
                  Telegram
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}