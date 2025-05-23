"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { currencies } from "@/lib/currency-data"

interface CurrencySelectProps {
  value: string
  onValueChange: (value: string) => void
  label: string
}

export function CurrencySelect({ value, onValueChange, label }: CurrencySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.code} - {currency.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}