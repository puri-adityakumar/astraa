"use client"

/**
 * Legacy landing background.
 *
 * v2 monochrome overhaul: the emerald/gradient PixelBlast background is retired.
 * The page atmosphere (grayscale radial gradient) and grain are now mounted
 * globally in `app/layout.tsx` via the <Atmosphere/> and <Grain/> layers, so
 * this component renders nothing. The export is kept so existing importers do
 * not break.
 */
export function LandingBackground() {
  return null;
}
