"use client"

import { useEffect, useState } from "react"

interface Stats {
  visitors: number
  stars: number
  contributors: number
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K"
  }
  return num.toString()
}

const SEP =
  "inline-block w-px h-[11px] mx-[18px] opacity-60 bg-[color:var(--hairline-strong)]"

// Live site stats, styled to match the v2 hero mono stats row. Renders nothing
// until /api/stats resolves (silent fail keeps the hero clean if unavailable).
export function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setStats(data)
        }
      })
      .catch(() => {
        // Silent fail — hero simply omits the stats row.
      })
  }, [])

  if (!stats) {
    return null
  }

  const items = [
    { label: "visitors", value: stats.visitors },
    { label: "stars", value: stats.stars },
    { label: "contributors", value: stats.contributors },
  ]

  return (
    <div className="mt-10 inline-flex flex-wrap items-center justify-center font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground">
      {items.map((item, index) => (
        <span key={item.label} className="inline-flex items-center">
          {index > 0 ? <span aria-hidden="true" className={SEP} /> : null}
          <b className="mr-1.5 font-semibold text-foreground tabular-nums">
            {formatNumber(item.value)}
          </b>
          {item.label}
        </span>
      ))}
    </div>
  )
}
