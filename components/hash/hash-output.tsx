"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { hashAlgorithms } from "@/lib/hash"

interface HashOutputProps {
  type: string
  hash: string
}

export function HashOutput({ type, hash }: HashOutputProps) {
  const { toast } = useToast()
  const algorithm = hashAlgorithms.find(algo => algo.id === type)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(hash)
    toast({
      title: "Copied!",
      description: `${algorithm?.name || type.toUpperCase()} hash copied to clipboard`
    })
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={type}>{algorithm?.name || type.toUpperCase()}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={type}
          value={hash}
          readOnly
          className="font-mono text-xs sm:text-sm"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={copyToClipboard}
          disabled={!hash}
          className="shrink-0"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}