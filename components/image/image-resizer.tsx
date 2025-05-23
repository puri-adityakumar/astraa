"use client"

import { useState, useRef } from "react"
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
  const [options, setOptions] = useState<ImageOptions>({
    format: 'image/jpeg',
    quality: 80
  })
  
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Image Resizer</h1>
        <p className="text-muted-foreground">
          Upload and resize your images with format options
        </p>
      </div>

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-[1fr,300px]">
          <div className="space-y-4">
            <ImagePreview image={image} />
            <div className="p-4 border rounded-lg bg-muted/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full"
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <ImageControls
            dimensions={dimensions}
            options={options}
            onWidthChange={(value) => setDimensions(calculateDimensions(value, originalSize, true))}
            onHeightChange={(value) => setDimensions(calculateDimensions(value, originalSize, false))}
            onOptionsChange={(newOptions) => setOptions({ ...options, ...newOptions })}
            onImageUpload={handleImageUpload}
            onDownload={handleDownload}
            disabled={!image}
          />
        </div>
      </Card>
    </div>
  )
}