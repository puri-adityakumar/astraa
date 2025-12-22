"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { hexToRgb } from "@/lib/colors/color-utils"

export default function ColorPicker() {
  const { toast } = useToast()
  const [colors] = useState([
    "#FDF7F4",
    "#8EB486",
    "#997C70",
    "#685752"
  ])
  const [selectedColor, setSelectedColor] = useState(colors[0])

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value)
    toast({
      title: "Copied!",
      description: `${value} copied to clipboard`
    })
  }

  const getRgbString = (hex: string) => {
    const rgb = hexToRgb(hex)
    return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : ""
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Color Picker</h1>
        <p className="text-muted-foreground">
          Create and explore beautiful color combinations
        </p>
      </div>

      <Card className="p-6 space-y-8">
        {/* Color Preview */}
        <div className="grid grid-cols-1 gap-2">
          {colors.map((color, index) => (
            <div
              key={index}
              className="h-24 rounded-lg transition-transform hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>

        {/* Color Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Selected Color</Label>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg"
                style={{ backgroundColor: selectedColor }}
              />
              <Input
                value={selectedColor?.toUpperCase() ?? ''}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => selectedColor && copyToClipboard(selectedColor)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>RGB Value</Label>
            <div className="flex items-center gap-2">
              <Input
                value={selectedColor ? getRgbString(selectedColor) : ''}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => selectedColor && copyToClipboard(getRgbString(selectedColor))}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}