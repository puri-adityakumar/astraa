"use client"

import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { Github, Twitter, Send } from "lucide-react"
import { Logo } from "@/components/logo"
import { AvatarCircles } from "@/components/ui/avatar-circles"

interface Contributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

/** system.css .footer — border-top hairline, mono small text, logo wordmark */
export function Footer() {
  const [contributors, setContributors] = useState<Contributor[]>([])

  useEffect(() => {
    fetch("https://api.github.com/repos/puri-adityakumar/astraa/contributors")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setContributors(data)
        }
      })
      .catch(() => {
        // Silent fail — default avatar shown
      })
  }, [])

  const avatarUrls = useMemo(() => {
    if (contributors.length > 0) {
      return contributors.slice(0, 5).map((c) => ({
        imageUrl: c.avatar_url,
        profileUrl: c.html_url,
      }))
    }
    return [
      {
        imageUrl: "https://github.com/puri-adityakumar.png",
        profileUrl: "https://github.com/puri-adityakumar",
      },
    ]
  }, [contributors])

  const remainingCount = contributors.length > 5 ? contributors.length - 5 : 0

  return (
    <footer
      className="relative"
      style={{
        borderTop: "1px solid var(--hairline)",
        paddingBlock: 40,
        marginTop: 32,
      }}
    >
      <div
        className="w-full mx-auto"
        style={{ maxWidth: "var(--maxw, 1080px)", paddingInline: 28 }}
      >
        {/* Inner row */}
        <div
          className="flex flex-wrap items-center justify-between"
          style={{ gap: 18 }}
        >
          {/* Left: logo + tagline + contributors */}
          <div className="flex flex-col gap-3" style={{ maxWidth: 400 }}>
            <Logo />
            <p
              className="font-mono text-[12px] tracking-[.04em] leading-relaxed"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              A collection of helpful utility tools for developers and
              creators — built for speed, accessibility, and ease of use.
            </p>
            <div className="flex items-center gap-3">
              <small
                className="font-mono text-[12px] tracking-[.04em]"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                Contributed by:
              </small>
              <AvatarCircles avatarUrls={avatarUrls} numPeople={remainingCount} />
            </div>
          </div>

          {/* Right: social icons + links */}
          <div className="flex flex-col items-end gap-3">
            {/* Social icon buttons */}
            <div className="flex items-center gap-[10px]">
              {[
                {
                  href: "https://github.com/puri-adityakumar/astraa",
                  label: "GitHub",
                  icon: <Github className="w-[17px] h-[17px]" aria-hidden="true" />,
                },
                {
                  href: "https://x.com/astraadottech",
                  label: "X (Twitter)",
                  icon: <Twitter className="w-[16px] h-[16px]" aria-hidden="true" />,
                },
                {
                  href: "https://t.me/astraadottech",
                  label: "Telegram",
                  icon: <Send className="w-[16px] h-[16px]" aria-hidden="true" />,
                },
              ].map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex items-center justify-center rounded-[9px] footer-ibtn"
                  style={{
                    width: 38,
                    height: 38,
                    border: "1px solid var(--hairline)",
                    background: "transparent",
                    color: "hsl(var(--text-2))",
                    transition: "background .2s, border-color .2s, color .2s",
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Text links */}
            <nav
              aria-label="Footer links"
              className="flex flex-wrap items-center gap-4"
            >
              {[
                { href: "https://astraa.notion.site/roadmap", label: "Roadmap", external: true },
                { href: "https://astraa.notion.site/roadmap", label: "Docs", external: true },
                { href: "https://astraa.notion.site/changelog", label: "Changelog", external: true },
                { href: "/privacy", label: "Privacy Policy", external: false },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="font-mono text-[12px] tracking-[.04em] footer-link"
                  style={{ color: "hsl(var(--muted-foreground))", transition: "color .15s" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom row */}
        <div
          className="flex justify-between items-center flex-wrap"
          style={{ marginTop: 24, gap: 8 }}
        >
          <small
            className="font-mono text-[12px] tracking-[.04em]"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            &copy; {new Date().getFullYear()} Astraa. All rights reserved.
          </small>
          <small
            className="font-mono text-[12px] tracking-[.04em]"
            style={{ color: "hsl(var(--faint))" }}
          >
            All processing happens locally in your browser.
          </small>
        </div>
      </div>

      {/* Scoped hover styles */}
      <style>{`
        .footer-ibtn:hover {
          background: var(--surface) !important;
          border-color: var(--hairline-strong) !important;
          color: hsl(var(--foreground)) !important;
        }
        .footer-link:hover { color: hsl(var(--foreground)) !important; }
      `}</style>
    </footer>
  )
}
