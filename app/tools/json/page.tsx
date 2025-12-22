"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Copy, Check, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function JsonValidator() {
  const { toast } = useToast()
  const [json, setJson] = useState("")
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [formattedJson, setFormattedJson] = useState("")

  const validateAndFormat = () => {
    try {
      const parsed = JSON.parse(json)
      const formatted = JSON.stringify(parsed, null, 2)
      setFormattedJson(formatted)
      setIsValid(true)
    } catch (error) {
      setIsValid(false)
      toast({
        title: "Invalid JSON",
        description: (error as Error).message,
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(formattedJson)
    toast({
      title: "Copied!",
      description: "JSON copied to clipboard"
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">JSON Validator</h1>
        <p className="text-muted-foreground">
          Validate and format JSON data
        </p>
      </div>

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Input JSON</Label>
              {isValid !== null && (
                <div className="flex items-center gap-2">
                  {isValid ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className={isValid ? "text-green-500" : "text-red-500"}>
                    {isValid ? "Valid JSON" : "Invalid JSON"}
                  </span>
                </div>
              )}
            </div>
            <Textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              placeholder="Paste your JSON here..."
              className="font-mono min-h-[300px]"
            />
            <Button
              className="w-full"
              onClick={validateAndFormat}
              disabled={!json}
            >
              Validate & Format
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Formatted JSON</Label>
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                disabled={!formattedJson}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="min-h-[300px] p-4 bg-muted rounded-md font-mono whitespace-pre overflow-auto">
              {formattedJson || "Formatted JSON will appear here"}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}