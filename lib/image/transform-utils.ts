import type { ImageDimensions, ImageOptions } from './types';

export function resizeImage(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  dimensions: ImageDimensions
): void {
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);
}

export function downloadImage(
  canvas: HTMLCanvasElement,
  options: ImageOptions
): void {
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resized-image.${options.format.split('/')[1]}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    options.format,
    options.quality / 100
  );
}