"use client"

import Image from "next/image"

interface ImagePreviewProps {
  image: string | null
}

export function ImagePreview({ image }: ImagePreviewProps) {
  return (
    <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
      {image ? (
        <Image
          src={image}
          alt="Preview"
          fill
          className="object-contain"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">
            Upload an image to preview
          </p>
        </div>
      )}
    </div>
  )
}