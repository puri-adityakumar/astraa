"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

const PixelBlast = dynamic(() => import("@/components/ui/pixel-blast"), {
  ssr: false,
})

export function LandingBackground() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Only show on landing page and disable on mobile
  if (pathname !== "/") return null
  if (!mounted) return null
  if (isMobile) return null

  const pixelColor = resolvedTheme === "dark" ? "#B19EEF" : "#22c55e"

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <PixelBlast
        variant="circle"
        pixelSize={4}
        color={pixelColor}
        patternScale={1}
        patternDensity={0.55}
        pixelSizeJitter={0}
        enableRipples={false}
        liquid
        liquidStrength={0.1}
        liquidRadius={1}
        liquidWobbleSpeed={4.5}
        speed={0.5}
        edgeFade={0.25}
        transparent
      />
    </div>
  )
}
