"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { copyToClipboard } from "@/lib/clipboard"
import type { HashOutputs as HashOutputType } from "@/lib/hash"

interface HashOutputsProps {
  hashes: HashOutputType
}

export function HashOutputs({ hashes }: HashOutputsProps) {
  const { toast } = useToast()

  const handleCopyToClipboard = async (text: string, type: string) => {
    const result = await copyToClipboard(text)
    if (result.success) {
      toast({
        title: "Copied!",
        description: `${type.toUpperCase()} hash copied to clipboard`
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
    <div className="space-y-4">
      {Object.entries(hashes).map(([type, hash]) => (
        <div key={type} className="space-y-2">
          <Label htmlFor={type}>{type.toUpperCase()}</Label>
          <div className="flex items-center gap-2">
            <Input
              id={type}
              value={hash}
              readOnly
              className="font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopyToClipboard(hash, type)}
              disabled={!hash}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}