import type { ImageDimensions, ImageOptions } from "./types";

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
export function calculateDimensions(
  value: number,
  originalSize: { width: number; height: number },
  isWidth: boolean,
): ImageDimensions {
  const aspectRatio = originalSize.width / originalSize.height;

  if (isWidth) {
    return {
      width: value,
      height: Math.round(value / aspectRatio),
    };
  }

  return {
    width: Math.round(value * aspectRatio),
    height: value,
  };
}

/**
 * Resize an image by drawing it to a canvas with new dimensions
 */
export function resizeImage(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  dimensions: ImageDimensions,
): void {
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);
}

/**
 * Download the canvas content as an image file
 */
export function downloadImage(
  canvas: HTMLCanvasElement,
  options: ImageOptions,
): void {
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resized-image.${options.format.split("/")[1]}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    options.format,
    options.quality / 100,
  );
}
