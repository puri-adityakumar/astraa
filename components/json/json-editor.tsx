"use client"

import { useState, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Copy, Check, X, Minimize2, AlignLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { validateJson, formatJson, minifyJson, highlightJson } from "@/lib/json/json-utils"

const SAMPLE_JSON = `{
  "name": "astraa",
  "version": "1.0.0",
  "features": ["json", "markdown", "regex"],
  "active": true,
  "count": 42
}`

export function JsonEditorClient() {
  const { toast } = useToast()
  const [input, setInput] = useState(SAMPLE_JSON)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [errorInfo, setErrorInfo] = useState<{ message: string; line?: number; column?: number } | null>(null)
  const [formattedJson, setFormattedJson] = useState("")
  const [copied, setCopied] = useState(false)

  const validate = useCallback(() => {
    const result = validateJson(input)
    setIsValid(result.valid)
    if (result.valid && result.formatted) {
      setFormattedJson(result.formatted)
      setErrorInfo(null)
    } else if (result.error) {
      setErrorInfo(result.error)
      setFormattedJson("")
    }
  }, [input])

  useEffect(() => {
    const timer = setTimeout(validate, 300)
    return () => clearTimeout(timer)
  }, [validate])

  const handleFormat = () => {
    const formatted = formatJson(input)
    setInput(formatted)
  }

  const handleMinify = () => {
    const minified = minifyJson(input)
    setInput(minified)
  }

  const copyToClipboard = async () => {
    const textToCopy = formattedJson || input
    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    toast({ title: "Copied!", description: "JSON copied to clipboard" })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container px-4 sm:px-6 max-w-5xl pt-24 pb-12 space-y-8">
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          JSON Editor
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Validate, format, and edit JSON with syntax highlighting
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleFormat}>
            <AlignLeft className="h-4 w-4 mr-2" />
            Format
          </Button>
          <Button variant="outline" size="sm" onClick={handleMinify}>
            <Minimize2 className="h-4 w-4 mr-2" />
            Minify
          </Button>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            Copy
          </Button>
          <div className="ml-auto flex items-center gap-2">
            {isValid !== null && (
              <>
                {isValid ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className={isValid ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
                  {isValid ? "Valid JSON" : "Invalid JSON"}
                </span>
              </>
            )}
          </div>
        </div>

        {errorInfo && !isValid && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm font-mono">
            {errorInfo.line && errorInfo.column && (
              <span className="font-semibold">Line {errorInfo.line}, Column {errorInfo.column}: </span>
            )}
            {errorInfo.message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label>Input</Label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste or type your JSON here..."
              className="font-mono text-sm min-h-[400px] resize-none"
              spellCheck={false}
            />
          </div>

          <div className="space-y-2">
            <Label>Formatted Output</Label>
            <div className="min-h-[400px] p-4 bg-muted/50 rounded-md font-mono text-sm whitespace-pre overflow-auto border">
              {formattedJson ? (
                <div dangerouslySetInnerHTML={{ __html: highlightJson(formattedJson) }} />
              ) : (
                <span className="text-muted-foreground">
                  {input ? "Fix errors to see formatted output" : "Enter JSON to see formatted output"}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
