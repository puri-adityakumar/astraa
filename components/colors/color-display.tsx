"use client"

import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { copyToClipboard } from "@/lib/clipboard"

interface ColorDisplayProps {
  color: string
  label?: string
  onClick?: () => void
}

export function ColorDisplay({ color, label, onClick }: ColorDisplayProps) {
  const { toast } = useToast()

  const handleCopyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const result = await copyToClipboard(color)
    if (result.success) {
      toast({
        title: "Copied!",
        description: `${color} copied to clipboard`
      })
    } else {
      toast({
        title: "Copy failed",
        description: result.error,
        variant: "destructive"
      })
    }
  }

  return (
    <div
      className="relative group rounded-lg overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div
        className="aspect-square"
        style={{ backgroundColor: color }}
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button
          variant="outline"
          size="icon"
          className="absolute top-2 right-2"
          onClick={handleCopyToClipboard}
        >
          <Copy className="h-4 w-4" />
        </Button>
        {label && (
          <p className="text-white font-mono">{label}</p>
        )}
      </div>
    </div>
  )
}