"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FiatConverter } from "./fiat-converter"
import { CryptoConverter } from "./crypto-converter"

export function CurrencyConverterClient() {
  const [amount, setAmount] = useState<string>("")
  const [result, setResult] = useState<string>("")

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Currency Converter</h1>
        <p className="text-muted-foreground">
          Convert between different currencies and cryptocurrencies using real-time rates
        </p>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="fiat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fiat">Fiat Currency</TabsTrigger>
            <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
          </TabsList>

          <TabsContent value="fiat">
            <FiatConverter
              amount={amount}
              onAmountChange={setAmount}
              onResult={setResult}
            />
          </TabsContent>

          <TabsContent value="crypto">
            <CryptoConverter
              amount={amount}
              onAmountChange={setAmount}
              onResult={setResult}
            />
          </TabsContent>

          {result && (
            <div className="p-4 rounded-lg glass text-center mt-4">
              <p className="text-lg font-mono">{result}</p>
            </div>
          )}
        </Tabs>
      </Card>
    </div>
  )
}