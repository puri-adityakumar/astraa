"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cryptocurrencies } from "@/lib/crypto-data";

interface CryptoSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function CryptoSelect({ value, onValueChange }: CryptoSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-11 w-full">
        <SelectValue placeholder="Select cryptocurrency" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {cryptocurrencies.map((crypto) => (
          <SelectItem key={crypto.id} value={crypto.id}>
            <div className="flex items-center gap-3">
              <img
                src={`https://assets.coincap.io/assets/icons/${crypto.symbol.toLowerCase()}@2x.png`}
                width={20}
                height={20}
                alt={`${crypto.name} icon`}
                className="rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://cdn-icons-png.flaticon.com/512/1213/1213032.png"; // Fallback generic coin
                  e.currentTarget.onerror = null;
                }}
              />
              <span className="font-medium">{crypto.symbol}</span>
              <span className="hidden text-xs text-muted-foreground sm:inline-block">
                - {crypto.name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
