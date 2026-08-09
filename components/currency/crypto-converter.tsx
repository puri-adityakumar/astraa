"use client";

import { useState } from "react";
import { ArrowDown, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useExchangeRate } from "@/hooks/use-exchange-rate";
import type { CryptoId } from "@/lib/crypto-data";
import type { CurrencyCode } from "@/lib/currency-data";
import { formatConvertedAmount, parseConversionAmount } from "@/lib/rates/conversion";
import { CryptoSelect } from "./crypto-select";
import { CurrencySelect } from "./currency-select";

interface CryptoConverterProps {
  amount: string;
  onAmountChange: (value: string) => void;
}

export function CryptoConverter({ amount, onAmountChange }: CryptoConverterProps) {
  const [cryptoCurrency, setCryptoCurrency] = useState<CryptoId>("bitcoin");
  const [fiatCurrency, setFiatCurrency] = useState<CurrencyCode>("USD");
  const { rate, status, refresh } = useExchangeRate("crypto", cryptoCurrency, fiatCurrency);
  const parsedAmount = parseConversionAmount(amount);
  const result = formatConvertedAmount(amount, rate, 6);
  const hasInvalidAmount = amount.trim() !== "" && parsedAmount === null;
  const statusMessage = getStatusMessage(status, hasInvalidAmount, rate !== null);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="crypto-amount" className="text-base font-semibold">
          From
        </Label>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              id="crypto-amount"
              type="number"
              min="0"
              inputMode="decimal"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="Enter amount"
              className="h-11 font-mono text-lg"
              aria-invalid={hasInvalidAmount}
              aria-describedby="crypto-rate-status"
            />
          </div>
          <div className="w-full sm:w-[280px]">
            <CryptoSelect
              value={cryptoCurrency}
              onValueChange={(value) => setCryptoCurrency(value as CryptoId)}
              label="Cryptocurrency"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center" aria-hidden="true">
        <div className="rounded-full bg-muted p-2">
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="crypto-result" className="text-base font-semibold">
          To
        </Label>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Input
              id="crypto-result"
              readOnly
              value={result}
              placeholder={status === "loading" ? "Loading rate..." : "Result"}
              className="h-11 bg-muted/50 font-mono text-lg"
              aria-label={`Converted amount in ${fiatCurrency}`}
            />
          </div>
          <div className="w-full sm:w-[280px]">
            <CurrencySelect
              value={fiatCurrency}
              onValueChange={(value) => setFiatCurrency(value as CurrencyCode)}
              label="Fiat currency"
            />
          </div>
        </div>
      </div>

      <div
        id="crypto-rate-status"
        className="flex min-h-touch items-center justify-between gap-3 text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span>
          {result ? `${amount} ${cryptoCurrency} = ${result} ${fiatCurrency}` : statusMessage}
        </span>
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
  if (status === "loading") return "Loading the crypto rate…";
  if (status === "refreshing") return "Updating the crypto rate…";
  if (status === "error" && hasRate) return "Showing the last rate; refresh failed.";
  if (status === "error") return "The crypto rate is unavailable.";
  return "Enter an amount to convert.";
}
