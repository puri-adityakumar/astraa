"use client"

import { useState, useEffect, useCallback } from "react"
import { PasswordDisplay } from "./password-display"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { generatePassword, generateMemorablePassword, generatePin } from "@/lib/password/password-utils"
import { cn } from "@/lib/utils"
import { Shuffle, Lightbulb, Hash } from "lucide-react"

type GenMode = "random" | "memorable" | "pin"

export function PasswordGeneratorClient() {
  const { toast } = useToast()

  // -- State --
  const [mode, setMode] = useState<GenMode>("random")
  const [password, setPassword] = useState("")

  // Random Mode State
  const [length, setLength] = useState([20])
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  })

  // Memorable Mode State
  const [wordCount, setWordCount] = useState([5])
  const [memOptions, setMemOptions] = useState({
    capitalize: true,
    fullWords: true
  })

  // PIN Mode State
  const [pinLength, setPinLength] = useState([4])

  // -- Generation Logic --
  const generate = useCallback(() => {
    let result
    if (mode === "random") {
      result = generatePassword(length[0] ?? 20, options)
    } else if (mode === "memorable") {
      result = generateMemorablePassword(wordCount[0] ?? 5, memOptions.capitalize)
    } else {
      result = generatePin(pinLength[0] ?? 4)
    }

    if (result.success) {
      setPassword(result.password)
    }
  }, [mode, length, options, wordCount, memOptions, pinLength])

  // Initial generate
  useEffect(() => {
    generate()
  }, [generate])

  const copyToClipboard = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    toast({
      title: "Copied!",
      description: "Password copied to clipboard",
    })
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
      </div>

      <div className="bg-card border border-border/50 rounded-xl shadow-sm p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">

        {/* 1. Choose Password Type (Tabs) */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Choose password type</Label>
          <div className="grid grid-cols-1 xs:grid-cols-3 p-1 bg-muted/50 rounded-lg">
            <button
              onClick={() => setMode("random")}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                mode === "random"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              <Shuffle className="w-4 h-4" />
              Random
            </button>
            <button
              onClick={() => setMode("memorable")}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                mode === "memorable"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              <Lightbulb className="w-4 h-4" />
              Memorable
            </button>
            <button
              onClick={() => setMode("pin")}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                mode === "pin"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              <Hash className="w-4 h-4" />
              PIN
            </button>
          </div>
        </div>

        {/* 2. Customize Section */}
        <div className="space-y-6">
          <Label className="text-base font-semibold">Customize your new password</Label>

          <div className="space-y-6 px-1">
            {/* Length Slider - Context Aware */}
            <div className="flex items-center gap-4 sm:gap-6">
              <Label className="w-20 sm:w-24 shrink-0 text-muted-foreground font-normal text-sm sm:text-base">
                {mode === "memorable" ? "Words" : "Characters"}
              </Label>
              <Slider
                value={mode === "random" ? length : mode === "memorable" ? wordCount : pinLength}
                onValueChange={(val) => {
                  if (mode === "random") setLength(val)
                  else if (mode === "memorable") setWordCount(val)
                  else setPinLength(val)
                }}
                min={mode === "random" ? 6 : mode === "memorable" ? 3 : 3}
                max={mode === "random" ? 64 : mode === "memorable" ? 15 : 12}
                step={1}
                className="flex-1"
              />
              <div className="w-10 sm:w-12 text-center py-1 px-2 bg-muted/50 rounded-md border text-sm sm:text-sm font-mono font-medium tabular-nums shrink-0">
                {mode === "random" ? length[0] : mode === "memorable" ? wordCount[0] : pinLength[0]}
              </div>
            </div>

            <div className="h-px bg-border/50" />

            {/* Toggles - Context Aware */}
            {mode === "random" && (
              <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-8 gap-y-4">
                <div className="flex items-center gap-3">
                  <Label htmlFor="numbers" className="font-normal text-muted-foreground cursor-pointer text-sm sm:text-base">Numbers</Label>
                  <Switch
                    id="numbers"
                    checked={options.numbers}
                    onCheckedChange={(c) => setOptions(prev => ({ ...prev, numbers: c }))}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="symbols" className="font-normal text-muted-foreground cursor-pointer text-sm sm:text-base">Symbols</Label>
                  <Switch
                    id="symbols"
                    checked={options.symbols}
                    onCheckedChange={(c) => setOptions(prev => ({ ...prev, symbols: c }))}
                  />
                </div>
              </div>
            )}

            {mode === "memorable" && (
              <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-8 gap-y-4">
                <div className="flex items-center gap-3">
                  <Label htmlFor="capitalize" className="font-normal text-muted-foreground cursor-pointer text-sm sm:text-base">Capitalize</Label>
                  <Switch
                    id="capitalize"
                    checked={memOptions.capitalize}
                    onCheckedChange={(c) => setMemOptions(prev => ({ ...prev, capitalize: c }))}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="fullwords" className="font-normal text-muted-foreground cursor-pointer text-sm sm:text-base">Full words</Label>
                  <Switch
                    id="fullwords"
                    checked={memOptions.fullWords}
                    onCheckedChange={(c) => setMemOptions(prev => ({ ...prev, fullWords: c }))}
                  />
                </div>
              </div>
            )}

            {mode === "pin" && (
              <div className="text-sm text-muted-foreground italic">
                Numeric PIN codes only contain numbers.
              </div>
            )}
          </div>
        </div>

        {/* 3. Generated Password Display & Buttons */}
        <div className="space-y-6 pt-2">
          <Label className="text-base font-semibold">Generated password</Label>

          <PasswordDisplay password={password} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base h-12"
              onClick={copyToClipboard}
            >
              Copy password
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full font-semibold text-base h-12 border-2 hover:bg-muted/50"
              onClick={generate}
            >
              Refresh password
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}