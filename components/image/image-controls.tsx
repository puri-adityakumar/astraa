"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Lock, Unlock, RotateCcw } from "lucide-react"
import { FormatSelector } from "./format-selector"
import type { ImageOptions } from "@/lib/image/types"
import { cn } from "@/lib/utils"

interface ImageControlsProps {
  dimensions: { width: number; height: number }
  options: ImageOptions
  isLocked: boolean
  originalByteSize: number | null
  estimatedByteSize: number | null
  onWidthChange: (value: number) => void
  onHeightChange: (value: number) => void
  onLockChange: (locked: boolean) => void
  onOptionsChange: (options: Partial<ImageOptions>) => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDownload: () => void
  onReset: () => void
  disabled: boolean
}

function formatBytes(bytes: number | null, decimals = 0) {
  if (!bytes) return '--'
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function ImageControls({
  dimensions,
  options,
  isLocked,
  originalByteSize,
  estimatedByteSize,
  onWidthChange,
  onHeightChange,
  onLockChange,
  onOptionsChange,
  onDownload,
  onReset,
  disabled,
}: ImageControlsProps) {
  return (
    <div className="space-y-8">
      {/* 1. Dimensions Section */}
      <div className="space-y-4">
        <div className="flex items-end gap-2">
          {/* Width */}
          <div className="flex-1 space-y-2">
            <Label className="text-muted-foreground font-normal">Width</Label>
            <Input
              type="number"
              value={dimensions.width}
              onChange={(e) => onWidthChange(Number(e.target.value))}
              min={1}
              disabled={disabled}
              className="h-10"
            />
          </div>

          {/* Lock Button */}
          <div className="shrink-0 flex items-center">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-10 w-10 transition-colors cursor-pointer",
                isLocked ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground"
              )}
              onClick={() => onLockChange(!isLocked)}
              disabled={disabled}
              title={isLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
              aria-pressed={isLocked}
              aria-label={isLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
            >
              {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </Button>
          </div>

          {/* Height */}
          <div className="flex-1 space-y-2">
            <Label className="text-muted-foreground font-normal">Height</Label>
            <Input
              type="number"
              value={dimensions.height}
              onChange={(e) => onHeightChange(Number(e.target.value))}
              min={1}
              disabled={disabled}
              className="h-10"
            />
          </div>

          {/* Unit Display (Static px for now) */}
          <div className="shrink-0 flex items-center">
            <div className="h-10 px-3 flex items-center justify-center bg-muted/50 border rounded-md text-sm text-muted-foreground">
              px
            </div>
          </div>
        </div>
      </div>

      {/* 2. Format & Quality */}
      <div className="space-y-6">
        <FormatSelector
          format={options.format}
          onFormatChange={(format) => onOptionsChange({ format })}
        />

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="font-normal text-muted-foreground">Quality</Label>
            <span className="text-sm font-medium">{options.quality}%</span>
          </div>
          <Slider
            value={[options.quality]}
            onValueChange={([value]) => value !== undefined && onOptionsChange({ quality: value })}
            min={1}
            max={100}
            step={1}
            disabled={disabled}
            className="[&_.bg-primary]:bg-foreground"
          />
        </div>
      </div>

      {/* 3. Info & Actions */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between text-sm">
          <div className="space-x-2">
            <span className="text-muted-foreground">Original size:</span>
            <span className="font-medium">{formatBytes(originalByteSize)}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={disabled}
            className="h-auto p-0 px-2 text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium">
          <span>New size:</span>
          <span className={cn(
            "transition-colors",
            estimatedByteSize && originalByteSize && estimatedByteSize > originalByteSize
              ? "text-yellow-600 dark:text-yellow-400"
              : estimatedByteSize && originalByteSize && estimatedByteSize < originalByteSize
                ? "text-emerald-600 dark:text-emerald-400"
                : ""
          )}>
            {formatBytes(estimatedByteSize)}
          </span>
        </div>


        <Button
          className="w-full h-11 text-base font-semibold"
          onClick={onDownload}
          disabled={disabled}
        >
          Download
        </Button>
      </div>
    </div>
  )
}