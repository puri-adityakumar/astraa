"use client";

import { useState } from "react";
import { ArrowDownUp, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useExchangeRate } from "@/hooks/use-exchange-rate";
import type { CurrencyCode } from "@/lib/currency-data";
import { formatConvertedAmount, parseConversionAmount } from "@/lib/rates/conversion";
import { CurrencySelect } from "./currency-select";

interface FiatConverterProps {
  amount: string;
  onAmountChange: (value: string) => void;
}

interface FiatPair {
  base: CurrencyCode;
  quote: CurrencyCode;
}

export function FiatConverter({ amount, onAmountChange }: FiatConverterProps) {
  const [pair, setPair] = useState<FiatPair>({ base: "USD", quote: "EUR" });
  const { rate, status, refresh } = useExchangeRate("fiat", pair.base, pair.quote);
  const parsedAmount = parseConversionAmount(amount);
  const result = formatConvertedAmount(amount, rate, 2);
  const hasInvalidAmount = amount.trim() !== "" && parsedAmount === null;

  const handleSwap = (): void => {
    setPair((current) => ({ base: current.quote, quote: current.base }));
  };

  const statusMessage = getStatusMessage(status, hasInvalidAmount, rate !== null);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fiat-amount" className="text-base font-semibold">
          From
        </Label>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              id="fiat-amount"
              type="number"
              min="0"
              inputMode="decimal"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="Enter amount"
              className="h-11 font-mono text-lg"
              aria-invalid={hasInvalidAmount}
              aria-describedby="fiat-rate-status"
            />
          </div>
          <div className="w-full sm:w-[280px]">
            <CurrencySelect
              value={pair.base}
              onValueChange={(base) =>
                setPair((current) => ({ ...current, base: base as CurrencyCode }))
              }
              label="From currency"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleSwap}
          className="min-h-touch min-w-touch rounded-full hover:bg-muted"
          aria-label={`Swap ${pair.base} and ${pair.quote}`}
        >
          <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fiat-result" className="text-base font-semibold">
          To
        </Label>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Input
              id="fiat-result"
              readOnly
              value={result}
              placeholder={status === "loading" ? "Loading rate..." : "Result"}
              className="h-11 bg-muted/50 font-mono text-lg"
              aria-label={`Converted amount in ${pair.quote}`}
            />
          </div>
          <div className="w-full sm:w-[280px]">
            <CurrencySelect
              value={pair.quote}
              onValueChange={(quote) =>
                setPair((current) => ({ ...current, quote: quote as CurrencyCode }))
              }
              label="To currency"
            />
          </div>
        </div>
      </div>

      <div
        id="fiat-rate-status"
        className="flex min-h-touch items-center justify-between gap-3 text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span>{result ? `${amount} ${pair.base} = ${result} ${pair.quote}` : statusMessage}</span>
        {status === "error" && (
          <Button type="button" variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

function getStatusMessage(
  status: "error" | "loading" | "ready" | "refreshing",
  hasInvalidAmount: boolean,
  hasRate: boolean,
): string {
  if (hasInvalidAmount) return "Enter a non-negative finite amount.";
  if (status === "loading") return "Loading the exchange rate…";
  if (status === "refreshing") return "Updating the exchange rate…";
  if (status === "error" && hasRate) return "Showing the last rate; refresh failed.";
  if (status === "error") return "The exchange rate is unavailable.";
  return "Enter an amount to convert.";
}
