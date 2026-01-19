"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Copy, Check, X, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { testRegex, highlightMatches, explainRegex, COMMON_PATTERNS } from "@/lib/regex/regex-utils"

const SAMPLE_TEXT = `Hello, my email is john.doe@example.com and my phone is +1-555-123-4567.
Visit https://example.com for more info.
Another email: jane_smith@company.org
Date: 2024-01-15
IP Address: 192.168.1.1
Color: #FF5733`

export function RegexTesterClient() {
  const { toast } = useToast()
  const [pattern, setPattern] = useState("")
  const [testString, setTestString] = useState(SAMPLE_TEXT)
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false, u: false })
  const [isValid, setIsValid] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [matches, setMatches] = useState<{ match: string; index: number; groups: string[] }[]>([])
  const [highlightedText, setHighlightedText] = useState("")
  const [showExplanation, setShowExplanation] = useState(true)
  const [showPatterns, setShowPatterns] = useState(false)
  const [copied, setCopied] = useState(false)

  const flagString = Object.entries(flags)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join("")

  const runTest = useCallback(() => {
    const result = testRegex(pattern, flagString, testString)
    setIsValid(result.valid)
    setErrorMessage(result.error || "")
    setMatches(result.matches)
    setHighlightedText(result.valid ? highlightMatches(testString, result.matches) : testString)
  }, [pattern, flagString, testString])

  useEffect(() => {
    const timer = setTimeout(runTest, 150)
    return () => clearTimeout(timer)
  }, [runTest])

  const copyPattern = async () => {
    if (!pattern) return
    await navigator.clipboard.writeText(`/${pattern}/${flagString}`)
    setCopied(true)
    toast({ title: "Copied!", description: "Regex copied to clipboard" })
    setTimeout(() => setCopied(false), 2000)
  }

  const insertPattern = (p: string) => {
    setPattern(p)
    setShowPatterns(false)
  }

  const explanation = explainRegex(pattern)

  return (
    <div className="container px-4 sm:px-6 max-w-5xl pt-24 pb-12 space-y-8">
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Regex Tester
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Real-time pattern matching with explanations
        </p>
      </div>

      <Card className="p-4 sm:p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Pattern</Label>
            <div className="flex items-center gap-2">
              {pattern && (
                <>
                  {isValid ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className={cn("text-sm", isValid ? "text-green-500" : "text-red-500")}>
                    {isValid ? "Valid" : "Invalid"}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">/</span>
              <Input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="font-mono pl-6 pr-6"
                spellCheck={false}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">/{flagString}</span>
            </div>
            <Button variant="outline" size="icon" onClick={copyPattern}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {!isValid && errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm font-mono">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            {(["g", "i", "m", "s", "u"] as const).map((flag) => (
              <div key={flag} className="flex items-center gap-2">
                <Switch
                  id={`flag-${flag}`}
                  checked={flags[flag]}
                  onCheckedChange={(c) => setFlags((prev) => ({ ...prev, [flag]: c }))}
                />
                <Label htmlFor={`flag-${flag}`} className="font-mono text-sm cursor-pointer">
                  {flag}
                  <span className="text-muted-foreground ml-1 font-normal">
                    ({flag === "g" ? "global" : flag === "i" ? "case-insensitive" : flag === "m" ? "multiline" : flag === "s" ? "dotAll" : "unicode"})
                  </span>
                </Label>
              </div>
            ))}
          </div>

          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPatterns(!showPatterns)}
              className="text-muted-foreground"
            >
              Common Patterns
              {showPatterns ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
            {showPatterns && (
              <div className="mt-2 flex flex-wrap gap-2">
                {COMMON_PATTERNS.map((p) => (
                  <Button
                    key={p.name}
                    variant="outline"
                    size="sm"
                    onClick={() => insertPattern(p.pattern)}
                    className="text-xs"
                  >
                    {p.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Test String</Label>
          <Textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against..."
            className="font-mono text-sm min-h-[150px] resize-none"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Matches ({matches.length})</Label>
          </div>
          <div
            className="min-h-[100px] p-4 bg-muted/50 rounded-md font-mono text-sm whitespace-pre-wrap border"
            dangerouslySetInnerHTML={{ __html: highlightedText || "<span class='text-muted-foreground'>Matches will be highlighted here</span>" }}
          />
        </div>

        {matches.length > 0 && (
          <div className="space-y-2">
            <Label>Match Details</Label>
            <div className="space-y-2 max-h-[200px] overflow-auto">
              {matches.map((m, idx) => (
                <div key={idx} className="p-2 bg-muted/30 rounded border text-sm font-mono">
                  <span className="text-muted-foreground">#{idx + 1}</span>{" "}
                  <span className="text-emerald-500">"{m.match}"</span>
                  <span className="text-muted-foreground"> at index {m.index}</span>
                  {m.groups.length > 0 && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Groups: {m.groups.map((g, i) => <span key={i} className="text-sky-400 mr-2">${i + 1}: "{g}"</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {pattern && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Pattern Explanation</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExplanation(!showExplanation)}
              >
                {showExplanation ? "Hide" : "Show"}
              </Button>
            </div>
            {showExplanation && explanation.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {explanation.map((part, idx) => (
                  <div
                    key={idx}
                    className="group relative px-2 py-1 bg-muted rounded border text-sm font-mono cursor-help"
                  >
                    {part.token}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border rounded shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {part.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
