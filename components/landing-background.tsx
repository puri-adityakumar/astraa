"use client"

import { useTheme } from "next-themes"
import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

const PixelBlast = dynamic(() => import("@/components/ui/pixel-blast"), {
  ssr: false,
})

function hasCapableGPU(): boolean {
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    if (!gl) return false
    // Check for hardware concurrency (CPU cores) as a proxy for device capability
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return false
    return true
  } catch {
    return false
  }
}

export function LandingBackground() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isCapable = useRef<boolean | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    if (isCapable.current === null) {
      isCapable.current = hasCapableGPU()
    }
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile, { passive: true })
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Use IntersectionObserver to only load when visible
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry?.isIntersecting ?? false),
      { threshold: 0.1 }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [mounted])

  // Only show on landing page, non-mobile, capable GPU
  if (pathname !== "/") return null
  if (!mounted) return null
  if (isMobile || !isCapable.current) return null

  const pixelColor = resolvedTheme === "dark" ? "#B19EEF" : "#22c55e"

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 pointer-events-none">
      {isVisible && <PixelBlast
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
      />}
    </div>
  )
}
