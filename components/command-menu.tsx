"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { useTools } from "@/lib/tools-context"
import { games } from "@/lib/games"
import { DialogTitle } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

// ─── Palette styles scoped to this component ─────────────────────────────────
const PALETTE_CSS = `
/* --surface alias if not defined by globals */
:root { --surface: hsl(var(--card)); }
.cmd-backdrop {
  position: fixed; inset: 0; z-index: 80;
  background: rgba(0,0,0,.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 14vh;
}
.cmd-palette {
  width: min(560px, 92vw);
  border: 1px solid var(--hairline);
  border-radius: 14px;
  background: var(--surface);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}
.cmd-input-row {
  display: flex; align-items: center; gap: 10px;
  padding: 16px;
  border-bottom: 1px solid var(--hairline);
  color: hsl(var(--muted-foreground));
  font-size: 15px;
}
.cmd-input-row input {
  flex: 1; background: none; border: none; outline: none;
  color: hsl(var(--foreground)); font: inherit;
}
.cmd-list {
  max-height: 320px; overflow: auto; padding: 8px;
}
.cmd-group-label {
  font-family: var(--font-geist-mono, monospace);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
  padding: 8px 12px 4px;
}
.cmd-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px;
  border-radius: 9px;
  font-size: 14px;
  color: hsl(var(--text-2));
  cursor: pointer;
  transition: background .1s, color .1s;
}
.cmd-item:hover, .cmd-item[data-active="true"] {
  background: hsl(var(--surface-2));
  color: hsl(var(--foreground));
}
.cmd-item .cmd-tag {
  margin-left: auto;
  font-family: var(--font-geist-mono, monospace);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
  border: 1px solid var(--hairline);
  border-radius: 4px;
  padding: 2px 6px;
  line-height: 1.3;
  white-space: nowrap;
}
.cmd-item .cmd-icon {
  width: 16px; height: 16px; flex: none;
  color: hsl(var(--muted-foreground));
  transition: color .1s;
}
.cmd-item:hover .cmd-icon { color: hsl(var(--foreground)); }
.cmd-item.cmd-disabled {
  opacity: 0.45; pointer-events: none;
}
.cmd-foot {
  border-top: 1px solid var(--hairline);
  padding: 8px 16px;
  display: flex; align-items: center; gap: 16px;
  font-family: var(--font-geist-mono, monospace);
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}
.cmd-foot-kbd {
  border: 1px solid var(--hairline);
  border-radius: 5px;
  padding: 2px 5px;
  font-size: 10px;
  background: hsl(var(--surface-2));
  color: hsl(var(--faint));
  letter-spacing: .04em;
  line-height: 1;
}
.cmd-empty {
  padding: 32px 16px;
  text-align: center;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}
`

// ─── Types ────────────────────────────────────────────────────────────────────
interface PaletteItem {
  key: string;
  name: string;
  description: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  disabled: boolean;
  badge: string | undefined;
}

interface PaletteGroup {
  name: string;
  items: PaletteItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CommandMenu() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [activeIdx, setActiveIdx] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { categories } = useTools()

  // ⌘K / Ctrl+K / ⌘/ to open; Escape to close
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      setSearch("")
      setActiveIdx(0)
    } else {
      // Focus input on open
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Build flat item list for keyboard nav
  const groups: PaletteGroup[] = React.useMemo(() => {
    const toolGroups: PaletteGroup[] = categories.map((cat) => ({
      name: cat.name,
      items: cat.items.map((t) => ({
        key: t.path,
        name: t.name,
        description: t.description,
        tag: t.wip ? "WIP" : t.comingSoon ? "Soon" : cat.name,
        icon: t.icon,
        path: t.path,
        disabled: t.comingSoon === true,
        badge: t.wip ? "WIP" : t.comingSoon ? "Soon" : undefined,
      })),
    }))

    const gameGroup: PaletteGroup = {
      name: "Games",
      items: games.map((g) => ({
        key: g.path,
        name: g.name,
        description: g.description,
        tag: g.comingSoon ? "Soon" : "Game",
        icon: g.icon,
        path: g.path,
        disabled: g.comingSoon === true,
        badge: g.comingSoon ? "Soon" : undefined,
      })),
    }

    return [...toolGroups, gameGroup]
  }, [categories])

  const flatItems = React.useMemo(() => {
    const q = search.toLowerCase()
    return groups.flatMap((g) =>
      g.items.filter(
        (item) =>
          !item.disabled &&
          (item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q)),
      ),
    )
  }, [groups, search])

  // Filtered groups (for display)
  const filteredGroups: PaletteGroup[] = React.useMemo(() => {
    const q = search.toLowerCase()
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length > 0)
  }, [groups, search])

  // Arrow-key navigation
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIdx((i) => Math.min(i + 1, flatItems.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIdx((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const item = flatItems[activeIdx]
        if (item) {
          setOpen(false)
          router.push(item.path)
        }
      }
    },
    [flatItems, activeIdx, router],
  )

  const runItem = React.useCallback(
    (path: string) => {
      setOpen(false)
      router.push(path)
    },
    [router],
  )

  // Track cumulative index across groups for keyboard nav
  let runningIdx = 0

  if (!open) {
    return (
      <>
        <style>{PALETTE_CSS}</style>
        {/* Visually hidden — this component exposes no trigger button;
            the Navigation opens the palette via the ⌘K event. */}
      </>
    )
  }

  return (
    <>
      <style>{PALETTE_CSS}</style>

      {/* Backdrop */}
      <div
        className="cmd-backdrop"
        onClick={() => setOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Search tools and games"
      >
        <VisuallyHidden.Root>
          <DialogTitle>Search tools and games</DialogTitle>
        </VisuallyHidden.Root>

        {/* Palette card — stop click propagation so clicks inside don't close */}
        <div
          className="cmd-palette"
          onClick={(e) => e.stopPropagation()}
          role="combobox"
          aria-expanded="true"
          aria-haspopup="listbox"
          aria-controls="cmd-listbox"
        >
          {/* Input row */}
          <div className="cmd-input-row">
            <Search className="w-[16px] h-[16px] flex-none opacity-70" aria-hidden="true" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setActiveIdx(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search tools and games…"
              aria-label="Search input"
              aria-autocomplete="list"
              aria-controls="cmd-listbox"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {/* List */}
          <div className="cmd-list" id="cmd-listbox" role="listbox">
            {filteredGroups.length === 0 && (
              <div className="cmd-empty">
                No results for &ldquo;{search}&rdquo;
              </div>
            )}

            {filteredGroups.map((group) => (
              <div key={group.name} role="group" aria-label={group.name}>
                <div className="cmd-group-label">{group.name}</div>
                {group.items.map((item) => {
                  const globalIdx = runningIdx++
                  const isActive = globalIdx === activeIdx
                  const IconComp = item.icon

                  return (
                    <div
                      key={item.key}
                      role="option"
                      aria-selected={isActive}
                      data-active={isActive ? "true" : undefined}
                      className={`cmd-item${item.disabled ? " cmd-disabled" : ""}`}
                      onClick={() => !item.disabled && runItem(item.path)}
                      onMouseEnter={() => setActiveIdx(globalIdx)}
                    >
                      <IconComp className="cmd-icon" aria-hidden="true" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <span
                          className="cmd-tag"
                          style={{ marginLeft: 0 }}
                        >
                          {item.badge}
                        </span>
                      )}
                      <span className="cmd-tag">{item.tag}</span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Footer keyboard hints */}
          <div className="cmd-foot">
            <span className="flex items-center gap-[6px]">
              <kbd className="cmd-foot-kbd">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-[6px]">
              <kbd className="cmd-foot-kbd">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-[6px]">
              <kbd className="cmd-foot-kbd">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
