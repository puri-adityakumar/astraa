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
  "inline-block w-px h-5 mx-3 opacity-60 bg-[color:var(--hairline-strong)] align-middle"

// Live site stats. Polar data-table "big number / muted label" row (compact in hero).
// Renders nothing until /api/stats resolves (silent fail keeps the hero clean if unavailable).
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
    <div className="mt-10 inline-flex flex-wrap items-center justify-center font-mono">
      {items.map((item, index) => (
        <span key={item.label} className="inline-flex items-center">
          {index > 0 ? <span aria-hidden="true" className={SEP} /> : null}
          <span className="inline-flex flex-col items-center">
            <span className="font-semibold text-[15px] leading-none tabular-nums text-foreground">
              {formatNumber(item.value)}
            </span>
            <span className="mt-px text-[9px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
              {item.label}
            </span>
          </span>
        </span>
      ))}
    </div>
  )
}
