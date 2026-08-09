"use client";

import Image from "next/image";

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

export function CurrencySelect({ value, onValueChange, label }: CurrencySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-11 w-full" aria-label={label}>
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <div className="flex items-center gap-3">
              <span
                className="relative h-[15px] w-5 shrink-0 overflow-hidden rounded-sm shadow-sm"
                aria-hidden="true"
              >
                <Image
                  src={`https://flagcdn.com/w40/${currency.countryCode}.png`}
                  alt=""
                  fill
                  sizes="20px"
                  className="object-cover"
                  loading="lazy"
                  unoptimized
                />
              </span>
              <span className="font-medium">{currency.code}</span>
              <span className="text-muted-foreground text-xs hidden sm:inline-block">
                - {currency.name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
