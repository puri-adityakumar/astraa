"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Github, Search, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/contribute", label: "Contribute" },
]

/** Segmented Dark / Light theme control — system.css .seg */
function ThemeSeg() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Stable SSR placeholder — same dimensions, invisible
  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="inline-flex p-[3px] rounded-[9px] opacity-0 pointer-events-none"
        style={{
          border: "1px solid var(--hairline)",
          background: "hsl(var(--surface-2))",
          height: 36,
          width: 140,
        }}
      />
    )
  }

  const isDark = theme === "dark"

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex p-[3px] rounded-[9px]"
      style={{ border: "1px solid var(--hairline)", background: "hsl(var(--surface-2))" }}
    >
      <button
        type="button"
        data-active={isDark ? "true" : "false"}
        onClick={() => setTheme("dark")}
        aria-pressed={isDark}
        aria-label="Dark theme"
        className="inline-flex items-center gap-[6px] font-mono text-[12px] tracking-[.04em] px-[10px] py-[5px] rounded-[6px] transition-colors duration-150"
        style={
          isDark
            ? {
                color: "hsl(var(--foreground))",
                background: "var(--surface, hsl(var(--card)))",
                boxShadow: "0 1px 0 var(--hairline)",
              }
            : { color: "hsl(var(--muted-foreground))" }
        }
      >
        <Moon className="w-[14px] h-[14px]" aria-hidden="true" />
        Dark
      </button>
      <button
        type="button"
        data-active={!isDark ? "true" : "false"}
        onClick={() => setTheme("light")}
        aria-pressed={!isDark}
        aria-label="Light theme"
        className="inline-flex items-center gap-[6px] font-mono text-[12px] tracking-[.04em] px-[10px] py-[5px] rounded-[6px] transition-colors duration-150"
        style={
          !isDark
            ? {
                color: "hsl(var(--foreground))",
                background: "var(--surface, hsl(var(--card)))",
                boxShadow: "0 1px 0 var(--hairline)",
              }
            : { color: "hsl(var(--muted-foreground))" }
        }
      >
        <Sun className="w-[14px] h-[14px]" aria-hidden="true" />
        Light
      </button>
    </div>
  )
}

/** Search trigger — dispatches ⌘K to let CommandMenu open the palette. */
function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <>
      {/* Desktop: full pill with placeholder text + kbd hint */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Open search (⌘K)"
        className={cn(
          "hidden sm:flex items-center gap-[10px] h-[38px] rounded-[9px] text-[14px]",
          "px-[12px] pr-[10px] transition-[border-color] duration-200",
          "nav-search-btn",
        )}
        style={{
          minWidth: 240,
          background: "hsl(var(--surface-2))",
          border: "1px solid var(--hairline)",
          color: "hsl(var(--muted-foreground))",
        }}
      >
        <Search className="w-[16px] h-[16px] opacity-70 flex-none" aria-hidden="true" />
        <span className="flex-1 text-left">Search tools…</span>
        <kbd
          className="font-mono text-[11px] rounded-[5px] px-[6px] py-[2px] leading-none tracking-[0.04em]"
          style={{
            color: "hsl(var(--faint))",
            border: "1px solid var(--hairline)",
            background: "var(--surface, hsl(var(--card)))",
          }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Mobile: icon-only 38×38 button */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Open search"
        className="flex sm:hidden items-center justify-center rounded-[9px] nav-ibtn"
        style={{
          width: 38,
          height: 38,
          border: "1px solid var(--hairline)",
          background: "transparent",
          color: "hsl(var(--text-2))",
        }}
      >
        <Search className="w-[17px] h-[17px]" aria-hidden="true" />
      </button>
    </>
  )
}

export function Navigation() {
  const pathname = usePathname()

  // Trigger CommandMenu's existing ⌘K listener — no duplicate logic needed
  const openPalette = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
    )
  }

  return (
    <>
      <style>{`
        /* --surface alias (hsl(var(--card))) for components that use system.css tokens */
        :root { --surface: hsl(var(--card)); }
        /* Nav-specific micro-styles */
        .nav-search-btn:hover { border-color: var(--hairline-strong); }
        .nav-ibtn:hover {
          background: var(--surface) !important;
          border-color: var(--hairline-strong) !important;
          color: hsl(var(--foreground)) !important;
        }
        .nav-link-item { color: hsl(var(--muted-foreground)); transition: color .15s ease; }
        .nav-link-item:hover,
        .nav-link-item[aria-current="page"] { color: hsl(var(--foreground)); }
        .nav-gh-btn { color: hsl(var(--text-2)); transition: background .2s, border-color .2s, color .2s; }
        .nav-gh-btn:hover {
          background: var(--surface) !important;
          border-color: var(--hairline-strong) !important;
          color: hsl(var(--foreground)) !important;
        }
      `}</style>

      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          height: "var(--nav-h, 64px)",
          display: "flex",
          alignItems: "center",
          gap: 18,
          paddingInline: 28,
          borderBottom: "1px solid var(--hairline)",
          background: "var(--nav-bg)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        {/* Logo — do not edit logo.tsx, just render it */}
        <Logo />

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Nav links — hidden below 560px via the scoped media-query below */}
        <div
          aria-label="Site links"
          className="nav-links-row"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className="nav-link-item text-[13px]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Search button */}
        <SearchButton onClick={openPalette} />

        {/* Theme segmented control */}
        <ThemeSeg />

        {/* GitHub icon button */}
        <a
          href="https://github.com/puri-adityakumar/astraa"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View on GitHub"
          className="inline-flex items-center justify-center rounded-[9px] nav-gh-btn"
          style={{
            width: 38,
            height: 38,
            border: "1px solid var(--hairline)",
            background: "transparent",
          }}
        >
          <Github className="w-[17px] h-[17px]" aria-hidden="true" />
        </a>
      </nav>

      {/* Scoped media-query to hide nav-links below 560px (system.css spec) */}
      <style>{`
        .nav-links-row {
          display: flex;
          align-items: center;
          gap: 22px;
          margin-right: 4px;
        }
        @media (max-width: 559px) {
          .nav-links-row { display: none; }
        }
      `}</style>
    </>
  )
}
