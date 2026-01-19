"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currencies } from "@/lib/currency-data";

interface CurrencySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
}

export function CurrencySelect({
  value,
  onValueChange,
  label,
}: CurrencySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-11 w-full">
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <div className="flex items-center gap-3">
              <img
                src={`https://flagcdn.com/w40/${currency.countryCode}.png`}
                srcSet={`https://flagcdn.com/w80/${currency.countryCode}.png 2x`}
                width={20}
                height={15}
                alt={`${currency.name} flag`}
                className="rounded-sm object-cover shadow-sm"
              />
              <span className="font-medium">{currency.code}</span>
              <span className="hidden text-xs text-muted-foreground sm:inline-block">
                - {currency.name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
