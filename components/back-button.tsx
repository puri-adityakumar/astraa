"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function BackButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className="mb-4 gap-2 -ml-2"
    >
      <Link href="/explore">
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Explore</span>
      </Link>
    </Button>
  )
}