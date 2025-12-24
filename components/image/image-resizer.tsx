"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ImagePreview } from "./image-preview"
import { ImageControls } from "./image-controls"
import { calculateDimensions } from "@/lib/image/resize-utils"
import { resizeImage, downloadImage } from "@/lib/image/transform-utils"
import type { ImageOptions } from "@/lib/image/types"

export function ImageResizerClient() {
  const { toast } = useToast()
  const [image, setImage] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 })
  const [fileSize, setFileSize] = useState<number | null>(null)
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null)
  const [isLocked, setIsLocked] = useState(true)
  const [options, setOptions] = useState<ImageOptions>({
    format: 'image/jpeg',
    quality: 80
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const calculateEstimate = useCallback(() => {
    if (!image || !canvasRef.current) return

    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current!
      // We don't need a full context draw for simple estimation if possible, 
      // but to be accurate with quality/format we should draw.
      // However, drawing large images frequently is heavy. 
      // Let's rely on debounce.
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = dimensions.width
      canvas.height = dimensions.height
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height)

      canvas.toBlob(
        (blob) => {
          if (blob) setEstimatedSize(blob.size)
        },
        options.format,
        options.quality / 100
      )
    }
    img.src = image
  }, [image, dimensions, options])

  // Debounced estimate
  useEffect(() => {
    const timer = setTimeout(calculateEstimate, 500)
    return () => clearTimeout(timer)
  }, [calculateEstimate])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      })
      return
    }

    setFileSize(file.size)
    setEstimatedSize(null) // Reset estimate until calculated

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setOriginalSize({ width: img.width, height: img.height })
        setDimensions({ width: img.width, height: img.height })
      }
      img.src = event.target?.result as string
      setImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDownload = async () => {
    if (!image || !canvasRef.current) return

    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!

      resizeImage(canvas, ctx, img, dimensions)
      downloadImage(canvas, options)
    }
    img.src = image
  }

  const handleWidthChange = (value: number) => {
    if (isLocked) {
      setDimensions(calculateDimensions(value, originalSize, true))
    } else {
      setDimensions(prev => ({ ...prev, width: value }))
    }
  }

  const handleHeightChange = (value: number) => {
    if (isLocked) {
      setDimensions(calculateDimensions(value, originalSize, false))
    } else {
      setDimensions(prev => ({ ...prev, height: value }))
    }
  }

  return (
    <div className="container max-w-5xl space-y-8 pt-24 pb-12">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Image Resizer
        </h1>
        <p className="text-muted-foreground text-lg">
          Upload and resize your images with format options.
        </p>
      </div>

      <Card className="p-6">
        <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
          <div className="space-y-4">
            <ImagePreview image={image} />
            <div className="p-8 border-2 border-dashed rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-center cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2 pointer-events-none">
                <span className="text-sm font-medium">Click to upload or drag and drop</span>
                <p className="text-xs text-muted-foreground">Supports JPEG, PNG, WebP</p>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <ImageControls
            dimensions={dimensions}
            options={options}
            isLocked={isLocked}
            originalByteSize={fileSize}
            estimatedByteSize={estimatedSize}
            onWidthChange={handleWidthChange}
            onHeightChange={handleHeightChange}
            onLockChange={setIsLocked}
            onOptionsChange={(newOptions) => setOptions({ ...options, ...newOptions })}
            onImageUpload={handleImageUpload}
            onDownload={handleDownload}
            onReset={() => setDimensions(originalSize)}
            disabled={!image}
          />
        </div>
      </Card>
    </div>
  )
}