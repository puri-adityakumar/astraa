"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Download } from "lucide-react"
import { FormatSelector } from "./format-selector"
import type { ImageFormat, ImageOptions } from "@/lib/image/types"

interface ImageControlsProps {
  dimensions: { width: number; height: number }
  options: ImageOptions
  onWidthChange: (value: number) => void
  onHeightChange: (value: number) => void
  onOptionsChange: (options: Partial<ImageOptions>) => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDownload: () => void
  disabled: boolean
}

export function ImageControls({
  dimensions,
  options,
  onWidthChange,
  onHeightChange,
  onOptionsChange,
  onImageUpload,
  onDownload,
  disabled,
}: ImageControlsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Width (px)</Label>
            <Input
              type="number"
              value={dimensions.width}
              onChange={(e) => onWidthChange(Number(e.target.value))}
              min={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Height (px)</Label>
            <Input
              type="number"
              value={dimensions.height}
              onChange={(e) => onHeightChange(Number(e.target.value))}
              min={1}
            />
          </div>
        </div>

        <FormatSelector
          format={options.format}
          onFormatChange={(format) => onOptionsChange({ format })}
        />

        <div className="space-y-2">
          <Label>Quality: {options.quality}%</Label>
          <Slider
            value={[options.quality]}
            onValueChange={([value]) => onOptionsChange({ quality: value })}
            min={1}
            max={100}
            step={1}
          />
        </div>
      </div>

      <Button 
        className="w-full" 
        onClick={onDownload}
        disabled={disabled}
      >
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
    </div>
  );
}