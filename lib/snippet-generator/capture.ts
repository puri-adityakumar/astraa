// lib/snippet-generator/capture.ts
import type { ExportScale } from "./export";
import type { AspectRatio } from "./types";

export type ExportSize = { width: number; height: number };

/**
 * Legacy export branch: the raster follows the measured on-screen canvas
 * bounds times the scale, so the output size depends on the viewport.
 */
export function measuredExportSize(
  width: number,
  height: number,
  scale: ExportScale,
): ExportSize {
  return { width: width * scale, height: height * scale };
}

/**
 * Terminal export branch: the raster is the selected composition size
 * (aspect.w × aspect.h) times the requested scale, independent of the
 * on-screen display bounds.
 */
export function selectedExportSize(
  aspect: AspectRatio,
  scale: ExportScale,
): ExportSize {
  return { width: aspect.w * scale, height: aspect.h * scale };
}

export type FittedDisplay = { width: number; height: number; scale: number };

/**
 * Terminal display fit: scale the canonical composition down into the host
 * column without upscaling past its natural size or exceeding a maximum
 * display height. Display-only — the result never feeds back into the store.
 */
export function fittedDisplaySize(
  hostWidth: number,
  maxHeight: number,
  aspect: AspectRatio,
): FittedDisplay {
  if (hostWidth <= 0 || maxHeight <= 0 || aspect.w <= 0 || aspect.h <= 0) {
    return { width: 0, height: 0, scale: 0 };
  }
  const scale = Math.min(hostWidth / aspect.w, maxHeight / aspect.h, 1);
  return { width: aspect.w * scale, height: aspect.h * scale, scale };
}
