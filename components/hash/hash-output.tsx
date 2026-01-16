"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { copyToClipboard } from "@/lib/clipboard"
import { hashAlgorithms } from "@/lib/hash"

interface HashOutputProps {
  type: string
  hash: string
}

export function HashOutput({ type, hash }: HashOutputProps) {
  const { toast } = useToast()
  const algorithm = hashAlgorithms.find(algo => algo.id === type)

  const handleCopyToClipboard = async () => {
    const result = await copyToClipboard(hash)
    if (result.success) {
      toast({
        title: "Copied!",
        description: `${algorithm?.name || type.toUpperCase()} hash copied to clipboard`
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
          onClick={handleCopyToClipboard}
          disabled={!hash}
          className="shrink-0"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}