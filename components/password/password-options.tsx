"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface PasswordOptionsProps {
  length: number[]
  options: {
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
  }
  onLengthChange: (value: number[]) => void
  onOptionsChange: (options: any) => void
}

export function PasswordOptions({
  length,
  options,
  onLengthChange,
  onOptionsChange,
}: PasswordOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Password Length: {length[0]}</Label>
        <Slider
          value={length}
          onValueChange={onLengthChange}
          min={6}
          max={32}
          step={1}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="uppercase">Include Uppercase</Label>
          <Switch
            id="uppercase"
            checked={options.uppercase}
            onCheckedChange={(checked) =>
              onOptionsChange({ ...options, uppercase: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="lowercase">Include Lowercase</Label>
          <Switch
            id="lowercase"
            checked={options.lowercase}
            onCheckedChange={(checked) =>
              onOptionsChange({ ...options, lowercase: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="numbers">Include Numbers</Label>
          <Switch
            id="numbers"
            checked={options.numbers}
            onCheckedChange={(checked) =>
              onOptionsChange({ ...options, numbers: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="symbols">Include Symbols</Label>
          <Switch
            id="symbols"
            checked={options.symbols}
            onCheckedChange={(checked) =>
              onOptionsChange({ ...options, symbols: checked })
            }
          />
        </div>
      </div>
    </div>
  )
}