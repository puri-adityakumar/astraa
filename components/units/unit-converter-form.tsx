"use client"


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
  resultValue?: string
}

export function UnitConverterForm({
  units,
  value,
  fromUnit,
  toUnit,
  onValueChange,
  onFromUnitChange,
  onToUnitChange,
  resultValue
}: UnitConverterFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* From Section */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">From</Label>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="number"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder="Enter value"
                className="h-11 font-mono text-lg"
              />
            </div>
            <div className="w-[180px]">
              <Select
                value={fromUnit.symbol}
                onValueChange={(value) => {
                  const unit = units.find(u => u.symbol === value)
                  if (unit) onFromUnitChange(unit)
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Unit" />
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
        </div>

        {/* Swap/Direction Indicator */}
        <div className="flex justify-center">
          <div className="bg-muted p-2 rounded-full">
            <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
          </div>
        </div>

        {/* To Section */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">To</Label>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                readOnly
                value={resultValue || ""}
                placeholder="Result will appear here"
                className="h-11 font-mono text-lg bg-muted/50"
              />
            </div>
            <div className="w-[180px]">
              <Select
                value={toUnit.symbol}
                onValueChange={(value) => {
                  const unit = units.find(u => u.symbol === value)
                  if (unit) onToUnitChange(unit)
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Unit" />
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
        </div>
      </div>
    </div>
  )
}