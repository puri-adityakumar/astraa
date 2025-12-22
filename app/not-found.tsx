"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/")
    }, 15000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <h1 className="text-9xl font-bold font-mono">404</h1>
      <h3 className="text-xl text-muted-foreground mt-4">Something went wrong</h3>
    </div>
  )
}