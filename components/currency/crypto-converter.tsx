"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowDownUp, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { CurrencySelect } from "./currency-select"
import { CryptoSelect } from "./crypto-select"
import type { CurrencyCode } from "@/lib/currency-data"
import type { CryptoId } from "@/lib/crypto-data"
import { getCryptoPrice } from "@/lib/api"

interface CryptoConverterProps {
  amount: string
  onAmountChange: (value: string) => void
  onResult: (value: string) => void
}

export function CryptoConverter({
  amount,
  onAmountChange,
  onResult
}: CryptoConverterProps) {
  const { toast } = useToast()
  const [cryptoCurrency, setCryptoCurrency] = useState<CryptoId>("bitcoin")
  const [fiatCurrency, setFiatCurrency] = useState<CurrencyCode>("USD")
  const [isLoading, setIsLoading] = useState(false)

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
      const price = await getCryptoPrice(cryptoCurrency, fiatCurrency)
      const converted = (Number(amount) * price).toFixed(2)
      onResult(`${amount} ${cryptoCurrency.toUpperCase()} = ${converted} ${fiatCurrency}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch crypto prices. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="crypto-amount">Amount</Label>
        <Input
          id="crypto-amount"
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="Enter amount..."
          className="font-mono"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr,auto,1fr]">
        <div className="space-y-2">
          <Label>Cryptocurrency</Label>
          <CryptoSelect
            value={cryptoCurrency}
            onValueChange={(value) => setCryptoCurrency(value as CryptoId)}
          />
        </div>

        <div className="flex items-end justify-center">
          <ArrowDownUp className="h-4 w-4 mb-4 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <Label>Fiat Currency</Label>
          <CurrencySelect
            value={fiatCurrency}
            onValueChange={(value) => setFiatCurrency(value as CurrencyCode)}
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