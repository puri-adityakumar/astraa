"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cryptocurrencies } from "@/lib/crypto-data"

interface CryptoSelectProps {
  value: string
  onValueChange: (value: string) => void
}

export function CryptoSelect({ value, onValueChange }: CryptoSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select cryptocurrency" />
      </SelectTrigger>
      <SelectContent>
        {cryptocurrencies.map((crypto) => (
          <SelectItem key={crypto.id} value={crypto.id}>
            {crypto.symbol} - {crypto.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}