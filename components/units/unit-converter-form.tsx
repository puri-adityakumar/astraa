"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRight } from "lucide-react"
import type { Unit } from "@/lib/unit-conversions"

interface UnitConverterFormProps {
  units: Unit[]
  value: string
  fromUnit: Unit
  toUnit: Unit
  onValueChange: (value: string) => void
  onFromUnitChange: (unit: Unit) => void
  onToUnitChange: (unit: Unit) => void
  onConvert: () => void
}

export function UnitConverterForm({
  units,
  value,
  fromUnit,
  toUnit,
  onValueChange,
  onFromUnitChange,
  onToUnitChange,
  onConvert
}: UnitConverterFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[1fr,auto,1fr]">
        <div className="space-y-2">
          <Label>From</Label>
          <Select
            value={fromUnit.symbol}
            onValueChange={(value) => {
              const unit = units.find(u => u.symbol === value)
              if (unit) onFromUnitChange(unit)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.symbol} value={unit.symbol}>
                  {unit.name} ({unit.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="space-y-2">
            <Input
              type="number"
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder="Enter value..."
            />
          </div>
        </div>

        <div className="flex items-end justify-center">
          <ArrowRight className="h-4 w-4 mb-[1.75rem] text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <Label>To</Label>
          <Select
            value={toUnit.symbol}
            onValueChange={(value) => {
              const unit = units.find(u => u.symbol === value)
              if (unit) onToUnitChange(unit)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.symbol} value={unit.symbol}>
                  {unit.name} ({unit.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button className="w-full" onClick={onConvert}>
        Convert
      </Button>
    </div>
  )
}