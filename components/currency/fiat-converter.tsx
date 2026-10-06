"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowDownUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { CurrencySelect } from "./currency-select"
import type { CurrencyCode } from "@/lib/currency-data"
import { getExchangeRate } from "@/lib/api"

interface FiatConverterProps {
  amount: string
  onAmountChange: (value: string) => void
  onResult: (value: string) => void
  result: string
  variant?: "page" | "panel"
}

export function FiatConverter({
  amount,
  onAmountChange,
  onResult,
  result,
  variant = "page"
}: FiatConverterProps) {
  const { toast } = useToast()
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>("USD")
  const [toCurrency, setToCurrency] = useState<CurrencyCode>("EUR")
  const [isLoading, setIsLoading] = useState(false)

  // Terminal panels adapt the amount/selector row to the measured host width
  // (wrap when 220px of amount + 280px selector + gap no longer fit); the page
  // keeps its viewport breakpoints.
  const rowClass = variant === "panel"
    ? "flex flex-wrap gap-4"
    : "flex flex-col sm:flex-row gap-4"
  const amountWrapClass = variant === "panel"
    ? "flex-1 basis-[220px]"
    : "flex-1"
  const selectorWrapClass = variant === "panel"
    ? "w-[280px] max-w-full"
    : "w-full sm:w-[280px]"

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  useEffect(() => {
    const calculate = async () => {
      if (!amount || isNaN(Number(amount))) {
        onResult("")
        return
      }

      setIsLoading(true)
      try {
        const rate = await getExchangeRate(fromCurrency, toCurrency)
        
        if (rate === null) {
          onResult("Error");
          toast({
            title: "Error",
            description: "Failed to fetch exchange rates. Please try again.",
            variant: "destructive",
          })
          return;
        }

        const converted = (Number(amount) * rate).toFixed(2)
        // Store just the numeric result or formatted string?
        // UnitConverter stores "1 USD = X EUR".
        // Let's store nicely formatted string in parent, but for the Input value?
        // Ideally the Input shows just the Number.

        // Revised plan: onResult updates the parent state (which we might unused if we display locally).
        // Let's return the formatted string to parent (for potential other uses)
        // AND keep a local or derived display for the input?

        // Actually, let's make the Input show the full formatted string "EUR 123.45" or similar?
        // Or just the number "123.45".
        // Let's go with just the number for the Input value.

        onResult(converted) // Just the number string
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to fetch exchange rates. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(() => {
      calculate()
    }, 500) // Debounce

    return () => clearTimeout(timer)
  }, [amount, fromCurrency, toCurrency, onResult, toast])

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* From Section */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">From</Label>
          <div className={rowClass}>
            <div className={amountWrapClass}>
              <Input
                id="fiat-amount"
                type="number"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="Enter amount"
                className="h-11 font-mono text-lg"
              />
            </div>
            <div className={selectorWrapClass}>
              <CurrencySelect
                value={fromCurrency}
                onValueChange={(value) => setFromCurrency(value as CurrencyCode)}
                label="currency"
              />
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwap}
            className="rounded-full hover:bg-muted"
            aria-label="Swap currencies"
          >
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* To Section */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">To</Label>
          <div className={rowClass}>
            <div className={amountWrapClass}>
              <Input
                readOnly
                placeholder="Result"
                value={isLoading ? "Converting..." : result}
                className="h-11 font-mono text-lg bg-muted/50"
              />
            </div>
            <div className={selectorWrapClass}>
              <CurrencySelect
                value={toCurrency}
                onValueChange={(value) => setToCurrency(value as CurrencyCode)}
                label="currency"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}