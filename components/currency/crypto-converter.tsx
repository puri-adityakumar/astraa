"use client";

import { useState, useEffect } from "react";
import { ArrowDownUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getCryptoPrice } from "@/lib/api";
import type { CryptoId } from "@/lib/crypto-data";
import type { CurrencyCode } from "@/lib/currency-data";
import { CryptoSelect } from "./crypto-select";
import { CurrencySelect } from "./currency-select";

interface CryptoConverterProps {
  amount: string;
  onAmountChange: (value: string) => void;
  onResult: (value: string) => void;
  result: string;
}

export function CryptoConverter({
  amount,
  onAmountChange,
  onResult,
  result,
}: CryptoConverterProps) {
  const { toast } = useToast();
  const [cryptoCurrency, setCryptoCurrency] = useState<CryptoId>("bitcoin");
  const [fiatCurrency, setFiatCurrency] = useState<CurrencyCode>("USD");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const calculate = async () => {
      if (!amount || isNaN(Number(amount))) {
        onResult("");
        return;
      }

      setIsLoading(true);
      try {
        const price = await getCryptoPrice(cryptoCurrency, fiatCurrency);

        if (price === null) {
          onResult("Error fetching price");
          toast({
            title: "Error",
            description: "Failed to fetch exchange rates. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const converted = (Number(amount) * price).toFixed(6); // More precision for crypto
        // Store numeric result string
        onResult(converted);
      } catch (error) {
        console.error(error);
        onResult("Error");
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      calculate();
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [amount, cryptoCurrency, fiatCurrency, onResult]);

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* From Section */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">From</Label>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Input
                id="crypto-amount"
                type="number"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="Enter amount"
                className="h-11 font-mono text-lg"
              />
            </div>
            <div className="w-full sm:w-[280px]">
              <CryptoSelect
                value={cryptoCurrency}
                onValueChange={(value) => setCryptoCurrency(value as CryptoId)}
              />
            </div>
          </div>
        </div>

        {/* Direction Indicator (Static for now as API is directional) */}
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-2">
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* To Section */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">To</Label>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Input
                readOnly
                placeholder="Result"
                value={isLoading ? "Converting..." : result}
                className="h-11 bg-muted/50 font-mono text-lg"
              />
            </div>
            <div className="w-full sm:w-[280px]">
              <CurrencySelect
                value={fiatCurrency}
                onValueChange={(value) =>
                  setFiatCurrency(value as CurrencyCode)
                }
                label="currency"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
