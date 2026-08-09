"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CryptoConverter } from "./crypto-converter";
import { FiatConverter } from "./fiat-converter";

type ConverterTab = "crypto" | "fiat";

export function CurrencyConverterClient() {
  const [activeTab, setActiveTab] = useState<ConverterTab>("fiat");
  const [amount, setAmount] = useState("1");

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
      <div className="space-y-3 border-b pb-8 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Currency Converter
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Convert between different currencies and cryptocurrencies using current rates.
        </p>
        <p className="text-xs text-muted-foreground">
          The selected pair goes through Astraa&apos;s rate endpoint to its data provider; your
          amount stays in this browser.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
        <nav className="space-y-1" aria-label="Converter type">
          <button
            type="button"
            onClick={() => setActiveTab("fiat")}
            className={cn(
              "flex min-h-touch w-full items-center rounded-md px-4 py-2.5 text-left text-sm font-medium transition-all duration-200",
              activeTab === "fiat"
                ? "bg-primary/10 text-primary shadow-sm hover:bg-primary/15"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
            aria-current={activeTab === "fiat" ? "page" : undefined}
          >
            Fiat Currency
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("crypto")}
            className={cn(
              "flex min-h-touch w-full items-center rounded-md px-4 py-2.5 text-left text-sm font-medium transition-all duration-200",
              activeTab === "crypto"
                ? "bg-primary/10 text-primary shadow-sm hover:bg-primary/15"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
            aria-current={activeTab === "crypto" ? "page" : undefined}
          >
            Cryptocurrency
          </button>
        </nav>

        <div className="min-h-[400px]">
          <Card className="h-full overflow-hidden border-border/50 shadow-sm">
            <div className="space-y-8 p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight">
                {activeTab === "fiat" ? "Fiat Currency Converter" : "Crypto Converter"}
              </h2>

              {activeTab === "fiat" ? (
                <FiatConverter amount={amount} onAmountChange={setAmount} />
              ) : (
                <CryptoConverter amount={amount} onAmountChange={setAmount} />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
