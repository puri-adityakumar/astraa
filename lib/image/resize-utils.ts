export function calculateDimensions(
  value: number,
  originalSize: { width: number; height: number },
  isWidth: boolean
): { width: number; height: number } {
  const aspectRatio = originalSize.width / originalSize.height
  
  if (isWidth) {
    return {
      width: value,
      height: Math.round(value / aspectRatio)
    }
  }
  
  return {
    width: Math.round(value * aspectRatio),
    height: value
  }
}

export function resizeImage(
  canvas: HTMLCanvasElement,
  image: string,
  dimensions: { width: number; height: number },
  quality: number
): Promise<void> {
  return new Promise((resolve) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = dimensions.width
      canvas.height = dimensions.height
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height)

      canvas.toBlob(
        (blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = "resized-image.jpg"
          a.click()
          URL.revokeObjectURL(url)
          resolve()
        },
        "image/jpeg",
        quality / 100
      )
    }
    img.src = image
  })
}