"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { FiatConverter } from "./fiat-converter"
import { CryptoConverter } from "./crypto-converter"

export function CurrencyConverterClient() {
  const [activeTab, setActiveTab] = useState("fiat")
  const [amount, setAmount] = useState<string>("1")
  const [result, setResult] = useState<string>("")

  // Reset result when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setResult("")
  }

  return (
    <div className="container max-w-5xl pt-24 pb-12 space-y-8">
      {/* Header */}
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Currency Converter
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Convert between different currencies and cryptocurrencies using real-time rates.
        </p>
        <p className="text-xs text-muted-foreground/70">
          Exchange rates from CoinGecko and exchangerate-api. No personal data transmitted.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar Navigation */}
        <div className="space-y-1">
          <nav className="space-y-1">
            <button
              onClick={() => handleTabChange("fiat")}
              className={cn(
                "w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 text-left",
                activeTab === "fiat"
                  ? "bg-primary/10 text-primary shadow-sm hover:bg-primary/15"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              Fiat Currency
            </button>
            <button
              onClick={() => handleTabChange("crypto")}
              className={cn(
                "w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 text-left",
                activeTab === "crypto"
                  ? "bg-primary/10 text-primary shadow-sm hover:bg-primary/15"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              Cryptocurrency
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="min-h-[400px]">
          <Card className="h-full border-border/50 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {activeTab === "fiat" ? "Fiat Currency Converter" : "Crypto Converter"}
                </h2>
              </div>

              {activeTab === "fiat" ? (
                <FiatConverter
                  amount={amount}
                  onAmountChange={setAmount}
                  onResult={setResult}
                  result={result}
                />
              ) : (
                <CryptoConverter
                  amount={amount}
                  onAmountChange={setAmount}
                  onResult={setResult}
                  result={result}
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}