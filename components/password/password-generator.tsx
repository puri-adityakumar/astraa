"use client"

import { useState, useEffect, useCallback } from "react"
import { PasswordDisplay } from "./password-display"
import { useToast } from "@/components/ui/use-toast"
import { generatePassword, generateMemorablePassword, generatePin } from "@/lib/password/password-utils"
import { copyToClipboard } from "@/lib/clipboard"
import { cn } from "@/lib/utils"
import { RefreshCw, Copy, Shuffle, Lightbulb, Hash } from "lucide-react"
import { useReducedMotion } from "@/lib/animations/hooks"

type GenMode = "random" | "memorable" | "pin"

function calcStrength(password: string): { bars: number; label: string } {
  if (!password) return { bars: 0, label: "NONE" }
  const len = password.length
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNum = /[0-9]/.test(password)
  const hasSym = /[^a-zA-Z0-9]/.test(password)
  const variety = [hasUpper, hasLower, hasNum, hasSym].filter(Boolean).length
  let score = 0
  if (len >= 8) score++
  if (len >= 12) score++
  if (len >= 16) score++
  if (variety >= 3) score++
  if (variety === 4) score++
  const bars = Math.min(4, Math.ceil(score * (4 / 5)))
  const labels = ["WEAK", "FAIR", "GOOD", "STRONG"]
  const label = labels[bars - 1] ?? (bars === 0 ? "WEAK" : "STRONG")
  return { bars: Math.max(1, bars), label }
}

export function PasswordGeneratorClient() {
  const { toast } = useToast()
  const reduceMotion = useReducedMotion()

  const [mode, setMode] = useState<GenMode>("random")
  const [password, setPassword] = useState("")

  const [length, setLength] = useState(20)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(false)

  const [wordCount, setWordCount] = useState(5)
  const [capitalize, setCapitalize] = useState(true)

  const [pinLength, setPinLength] = useState(4)

  const generate = useCallback(() => {
    let result
    if (mode === "random") {
      result = generatePassword(length, {
        uppercase: true,
        lowercase: true,
        numbers,
        symbols,
      })
    } else if (mode === "memorable") {
      result = generateMemorablePassword(wordCount, capitalize)
    } else {
      result = generatePin(pinLength)
    }
    if (result.success) {
      setPassword(result.password)
    }
  }, [mode, length, numbers, symbols, wordCount, capitalize, pinLength])

  useEffect(() => {
    setTimeout(() => generate(), 0)
  }, [generate])

  const handleCopy = async () => {
    if (!password) return
    const result = await copyToClipboard(password)
    if (result.success) {
      toast({ title: "Copied!", description: "Password copied to clipboard" })
    } else {
      toast({ title: "Copy failed", description: result.error, variant: "destructive" })
    }
  }

  const { bars, label } = calcStrength(password)

  // slider percentage for display
  const sliderPct =
    mode === "random"
      ? ((length - 6) / (64 - 6)) * 100
      : mode === "memorable"
        ? ((wordCount - 3) / (15 - 3)) * 100
        : ((pinLength - 3) / (12 - 3)) * 100

  const currentLen = mode === "random" ? length : mode === "memorable" ? wordCount : pinLength
  const minLen = mode === "pin" ? 3 : mode === "memorable" ? 3 : 6
  const maxLen = mode === "random" ? 64 : mode === "memorable" ? 15 : 12

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    if (mode === "random") setLength(v)
    else if (mode === "memorable") setWordCount(v)
    else setPinLength(v)
  }

  return (
    <div className="container px-4 sm:px-6 max-w-2xl pt-24 pb-12 space-y-8">
      {/* Header */}
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Password Generator
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg text-pretty">
          Generate secure, random passwords, memorable passphrases, or PIN codes instantly.
        </p>
        <p className="text-xs text-muted-foreground/70">
          All processing happens locally in your browser
        </p>
      </div>

      <div
        className="rounded-[var(--radius)] border p-5 sm:p-6 space-y-6"
        style={{ background: "hsl(var(--card))", borderColor: "var(--hairline, hsl(var(--border)))" }}
      >
        {/* Mode tabs */}
        <div
          className="inline-flex p-[3px] rounded-[9px] border"
          style={{ background: "hsl(var(--muted))", borderColor: "var(--hairline, hsl(var(--border)))" }}
          role="group"
          aria-label="Password type"
        >
          {(["random", "memorable", "pin"] as GenMode[]).map((m) => {
            const Icon = m === "random" ? Shuffle : m === "memorable" ? Lightbulb : Hash
            const label = m === "random" ? "Random" : m === "memorable" ? "Memorable" : "PIN"
            return (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  "inline-flex items-center gap-[6px] font-mono text-xs tracking-[0.04em] py-[5px] px-[10px] rounded-[6px] transition-colors duration-150 min-h-touch",
                  mode === m
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                style={
                  mode === m
                    ? {
                        background: "hsl(var(--card))",
                        boxShadow: "0 1px 0 var(--hairline, hsl(var(--border)))",
                      }
                    : undefined
                }
              >
                <Icon className="w-[14px] h-[14px]" aria-hidden />
                {label}
              </button>
            )
          })}
        </div>

        {/* Password output */}
        <PasswordDisplay password={password} />

        {/* Strength bar — grayscale per D2 */}
        <div className="space-y-[9px]">
          <div className="flex items-center justify-between">
            <span
              className="font-mono text-[10px] tracking-[0.14em] uppercase"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Strength
            </span>
            <span
              className="font-mono text-[11px] tracking-[0.14em] uppercase font-semibold"
              style={{ color: "hsl(var(--foreground))" }}
            >
              {password ? label : "—"}
            </span>
          </div>
          <div className="flex gap-[5px]" role="meter" aria-valuenow={bars} aria-valuemin={0} aria-valuemax={4} aria-label="Password strength">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-[6px] rounded-[2px] transition-colors duration-200"
                style={{
                  background: i < bars
                    ? "hsl(var(--foreground))"
                    : "var(--track, rgba(255,255,255,0.10))",
                }}
              />
            ))}
          </div>
        </div>

        {/* Length / Word count slider */}
        <div
          className="py-[14px] border-b"
          style={{ borderColor: "var(--hairline-faint, hsl(var(--border)/0.5))" }}
        >
          <div className="flex items-center justify-between gap-3">
            <span
              className="font-mono text-[10px] tracking-[0.14em] uppercase shrink-0"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              {mode === "memorable" ? "Words" : "Characters"}
            </span>
            <div className="relative flex-1 flex items-center">
              {/* Slider track */}
              <div
                className="relative flex-1 h-[4px] rounded-[999px] border"
                style={{ background: "var(--track, rgba(255,255,255,0.10))", borderColor: "var(--hairline, hsl(var(--border)))" }}
              >
                {/* Fill */}
                <div
                  className="absolute inset-y-0 left-0 rounded-[999px]"
                  style={{
                    width: `${sliderPct}%`,
                    background: "hsl(var(--foreground))",
                  }}
                />
                {/* Knob */}
                <div
                  className="absolute top-1/2 w-[14px] h-[14px] rounded-full border"
                  style={{
                    left: `${sliderPct}%`,
                    transform: "translate(-50%, -50%)",
                    background: "var(--knob, hsl(var(--background)))",
                    borderColor: "var(--hairline-strong, hsl(var(--border)))",
                  }}
                />
                <input
                  type="range"
                  min={minLen}
                  max={maxLen}
                  step={1}
                  value={currentLen}
                  onChange={handleSliderChange}
                  aria-label={mode === "memorable" ? "Word count" : "Character length"}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
            <div
              className="font-mono text-[14px] text-center w-10 shrink-0 py-1 px-2 rounded border"
              style={{
                color: "hsl(var(--foreground))",
                background: "hsl(var(--muted))",
                borderColor: "var(--hairline, hsl(var(--border)))",
              }}
            >
              {currentLen}
            </div>
          </div>
        </div>

        {/* Toggle rows */}
        {mode === "random" && (
          <div className="space-y-0">
            {[
              { key: "numbers" as const, label: "Numbers", value: numbers, set: setNumbers },
              { key: "symbols" as const, label: "Symbols", value: symbols, set: setSymbols },
            ].map(({ key, label, value, set }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 py-[14px] border-b last:border-b-0"
                style={{ borderColor: "var(--hairline-faint, hsl(var(--border)/0.5))" }}
              >
                <span className="text-sm" style={{ color: "hsl(var(--foreground))" }}>
                  {label}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={value}
                  onClick={() => set(!value)}
                  aria-label={`Toggle ${label}`}
                  className="relative w-[38px] h-[22px] rounded-full border flex-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[22px]"
                  style={{
                    background: value
                      ? "hsl(var(--foreground))"
                      : "var(--track, rgba(255,255,255,0.10))",
                    borderColor: value
                      ? "hsl(var(--foreground))"
                      : "var(--hairline, hsl(var(--border)))",
                  }}
                >
                  <span
                    className="absolute top-[2px] left-[2px] w-[16px] h-[16px] rounded-full transition-all duration-150"
                    style={{
                      transform: value ? "translateX(16px)" : "translateX(0)",
                      background: value
                        ? "var(--on-fg, hsl(var(--primary-foreground)))"
                        : "hsl(var(--muted-foreground))",
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {mode === "memorable" && (
          <div
            className="py-[14px] border-b"
            style={{ borderColor: "var(--hairline-faint, hsl(var(--border)/0.5))" }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm" style={{ color: "hsl(var(--foreground))" }}>
                Capitalize
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={capitalize}
                onClick={() => setCapitalize(!capitalize)}
                aria-label="Toggle capitalize"
                className="relative w-[38px] h-[22px] rounded-full border flex-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  background: capitalize
                    ? "hsl(var(--foreground))"
                    : "var(--track, rgba(255,255,255,0.10))",
                  borderColor: capitalize
                    ? "hsl(var(--foreground))"
                    : "var(--hairline, hsl(var(--border)))",
                }}
              >
                <span
                  className="absolute top-[2px] left-[2px] w-[16px] h-[16px] rounded-full transition-all duration-150"
                  style={{
                    transform: capitalize ? "translateX(16px)" : "translateX(0)",
                    background: capitalize
                      ? "var(--on-fg, hsl(var(--primary-foreground)))"
                      : "hsl(var(--muted-foreground))",
                  }}
                />
              </button>
            </div>
          </div>
        )}

        {mode === "pin" && (
          <p className="text-sm text-muted-foreground italic">
            Numeric PIN codes only contain numbers.
          </p>
        )}

        {/* Actions */}
        <div
          className="flex gap-2 pt-[12px] border-t"
          style={{ borderColor: "var(--hairline, hsl(var(--border)))", borderStyle: "dashed" }}
        >
          <button
            type="button"
            onClick={handleCopy}
            disabled={!password}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-[7px] h-[36px]",
              "border rounded-[8px] font-mono text-[10px] tracking-[0.1em] uppercase",
              "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "min-h-touch",
            )}
            style={{
              background: "hsl(var(--card))",
              borderColor: "var(--hairline, hsl(var(--border)))",
              color: "hsl(var(--muted-foreground))",
            }}
            onMouseEnter={(e) => {
              if (!reduceMotion) {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                  "var(--hairline-strong, hsl(var(--border)))"
                ;(e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--foreground))"
              }
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                "var(--hairline, hsl(var(--border)))"
              ;(e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--muted-foreground))"
            }}
          >
            <Copy className="w-[16px] h-[16px]" aria-hidden />
            <span>Copy</span>
          </button>
          <button
            type="button"
            onClick={generate}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-[7px] h-[36px]",
              "border rounded-[8px] font-mono text-[10px] tracking-[0.1em] uppercase",
              "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "min-h-touch",
            )}
            style={{
              background: "hsl(var(--card))",
              borderColor: "var(--hairline, hsl(var(--border)))",
              color: "hsl(var(--muted-foreground))",
            }}
            onMouseEnter={(e) => {
              if (!reduceMotion) {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                  "var(--hairline-strong, hsl(var(--border)))"
                ;(e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--foreground))"
              }
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                "var(--hairline, hsl(var(--border)))"
              ;(e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--muted-foreground))"
            }}
          >
            <RefreshCw className="w-[16px] h-[16px]" aria-hidden />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  )
}
