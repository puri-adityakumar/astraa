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
}

export function FiatConverter({
  amount,
  onAmountChange,
  onResult,
  result
}: FiatConverterProps) {
  const { toast } = useToast()
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>("USD")
  const [toCurrency, setToCurrency] = useState<CurrencyCode>("EUR")
  const [isLoading, setIsLoading] = useState(false)

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
          onResult("Error")
          throw new Error("Failed to fetch rate")
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                id="fiat-amount"
                type="number"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="Enter amount"
                className="h-11 font-mono text-lg"
              />
            </div>
            <div className="w-full sm:w-[280px]">
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
          >
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* To Section */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">To</Label>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Result Display directly in 'To' section if possible, or keep separate.
                 Since onResult is passed up, we might display it here as a read-only input or
                 just pass the props. But wait, the parent handles result display.
                 Actually, looking at UnitConverter, we merged the result into the "To" input.
                 Let's do that here too for consistency. We need to pass 'result' down or assume parent handles it.
                 The prop 'onResult' implies parent state.
                 However, the current FiatConverter implementation calculates it on button click.
                 Let's switch to automatic effect-based calculation like UnitConverter.
             */}
            {/*
                We need to change how this component works to be automatic.
                First, let's keep the layout simple, and maybe we can render the result *here*
                if we lift the calculation state or pass it down.
                Currently `onResult` sets a string in parent.
                Let's simplify: Display a readonly Input here that shows the loading state or result.
             */}
            <div className="flex-1 relative">
              <Input
                readOnly
                placeholder="Result"
                value={isLoading ? "Converting..." : result}
                className="h-11 font-mono text-lg bg-muted/50"
              />
              {/*
                  Wait, the parent `CurrencyConverterClient` displays the result in a separate box below.
                  We should probably follow the UnitConverter pattern completely and hide that box,
                  instead showing it in this input. But `amount` is state in parent?
                  Yes, `onAmountChange` updates parent.
                  Let's make this component handle the calculation automatically internally or via effect?
                  The parent passes `amount`.
              */}
            </div>
            <div className="w-full sm:w-[280px]">
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