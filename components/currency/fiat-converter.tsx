"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowDownUp, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { CurrencySelect } from "./currency-select"
import type { CurrencyCode } from "@/lib/currency-data"
import { getExchangeRate } from "@/lib/api"

interface FiatConverterProps {
  amount: string
  onAmountChange: (value: string) => void
  onResult: (value: string) => void
}

export function FiatConverter({ 
  amount, 
  onAmountChange, 
  onResult 
}: FiatConverterProps) {
  const { toast } = useToast()
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>("USD")
  const [toCurrency, setToCurrency] = useState<CurrencyCode>("EUR")
  const [isLoading, setIsLoading] = useState(false)

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const handleConvert = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const rate = await getExchangeRate(fromCurrency, toCurrency)
      const converted = (Number(amount) * rate).toFixed(2)
      onResult(`${amount} ${fromCurrency} = ${converted} ${toCurrency}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch exchange rates. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fiat-amount">Amount</Label>
        <Input
          id="fiat-amount"
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="Enter amount..."
          className="font-mono"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr,auto,1fr]">
        <div className="space-y-2">
          <Label>From</Label>
          <CurrencySelect
            value={fromCurrency}
            onValueChange={(value) => setFromCurrency(value as CurrencyCode)}
            label="currency"
          />
        </div>

        <div className="flex items-end justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwap}
            className="mb-2"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label>To</Label>
          <CurrencySelect
            value={toCurrency}
            onValueChange={(value) => setToCurrency(value as CurrencyCode)}
            label="currency"
          />
        </div>
      </div>

      <Button 
        className="w-full" 
        onClick={handleConvert}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Converting...
          </>
        ) : (
          "Convert"
        )}
      </Button>
    </div>
  )
}