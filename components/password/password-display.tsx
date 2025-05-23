"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PasswordDisplayProps {
  password: string
}

export function PasswordDisplay({ password }: PasswordDisplayProps) {
  const { toast } = useToast()

  const copyToClipboard = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    toast({
      title: "Copied!",
      description: "Password copied to clipboard",
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={password}
        readOnly
        placeholder="Generated password will appear here"
        className="font-mono"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={copyToClipboard}
        disabled={!password}
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  )
}