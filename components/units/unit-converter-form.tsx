"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import type { Unit } from "@/lib/unit-conversions";

interface UnitConverterFormProps {
  units: Unit[];
  value: string;
  fromUnit: Unit;
  toUnit: Unit;
  onValueChange: (value: string) => void;
  onFromUnitChange: (unit: Unit) => void;
  onToUnitChange: (unit: Unit) => void;
  resultValue?: string;
}

function formatConversionResult(resultValue: string | undefined, toUnit: Unit): string {
  if (!resultValue) return "";
  return `Converted result: ${resultValue} ${toUnit.name} (${toUnit.symbol})`;
}

export function UnitConverterForm({
  units,
  value,
  fromUnit,
  toUnit,
  onValueChange,
  onFromUnitChange,
  onToUnitChange,
  resultValue,
}: UnitConverterFormProps) {
  const [announcedResult, setAnnouncedResult] = useState(() =>
    formatConversionResult(resultValue, toUnit),
  );
  const unitPair = `${fromUnit.symbol}:${toUnit.symbol}`;
  const [announcedUnitPair, setAnnouncedUnitPair] = useState(unitPair);

  if (announcedUnitPair !== unitPair) {
    setAnnouncedUnitPair(unitPair);
    setAnnouncedResult(formatConversionResult(resultValue, toUnit));
  }

  const announceCurrentResult = () => {
    setAnnouncedResult(formatConversionResult(resultValue, toUnit));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* From Section */}
        <div className="space-y-2">
          <p className="text-base font-semibold">From</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Label htmlFor="unit-source-amount" className="sr-only">
                Source amount
              </Label>
              <Input
                id="unit-source-amount"
                type="number"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                onBlur={announceCurrentResult}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                }}
                placeholder="Enter value"
                className="h-11 font-mono text-base sm:text-lg"
              />
            </div>
            <div className="w-full sm:w-[180px]">
              <Select
                value={fromUnit.symbol}
                onValueChange={(value) => {
                  const unit = units.find((u) => u.symbol === value);
                  if (unit) {
                    onFromUnitChange(unit);
                  }
                }}
              >
                <SelectTrigger aria-label="Source unit" className="h-11">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.symbol} value={unit.symbol} className="text-sm">
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
            <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground" aria-hidden="true" />
          </div>
        </div>

        {/* To Section */}
        <div className="space-y-2">
          <p className="text-base font-semibold">To</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Label htmlFor="unit-destination-amount" className="sr-only">
                Destination amount
              </Label>
              <Input
                id="unit-destination-amount"
                readOnly
                value={resultValue || ""}
                aria-describedby="unit-conversion-status"
                placeholder="Result will appear here"
                className="h-11 font-mono text-base sm:text-lg bg-muted/50"
              />
            </div>
            <div className="w-full sm:w-[180px]">
              <Select
                value={toUnit.symbol}
                onValueChange={(value) => {
                  const unit = units.find((u) => u.symbol === value);
                  if (unit) {
                    onToUnitChange(unit);
                  }
                }}
              >
                <SelectTrigger aria-label="Destination unit" className="h-11">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.symbol} value={unit.symbol} className="text-sm">
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <p
          id="unit-conversion-status"
          role="status"
          aria-label="Conversion result"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcedResult}
        </p>
      </div>
    </div>
  );
}
