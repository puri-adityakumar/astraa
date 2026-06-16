import { cn } from "@/lib/utils";

type MarkerVariant = "cross" | "bracket";

interface CornerMarkersProps {
  variant?: MarkerVariant;
  className?: string;
}

const CORNERS = ["tl", "tr", "bl", "br"] as const;

type Corner = (typeof CORNERS)[number];

// Crosshair "+" marker (system.css .xmark): 11x11px, vertical 1px line via
// before:, horizontal 1px line via after:, color var(--marker), corners
// offset -5.5px. Lines drawn with arbitrary utilities (no globals.css edit).
const CROSS_BASE = cn(
  "absolute size-[11px] pointer-events-none z-10 text-[color:var(--marker)]",
  "before:content-[''] before:absolute before:left-1/2 before:top-0",
  "before:w-px before:h-full before:bg-current before:-translate-x-1/2",
  "after:content-[''] after:absolute after:top-1/2 after:left-0",
  "after:h-px after:w-full after:bg-current after:-translate-y-1/2",
);

const CROSS_CORNERS: Record<Corner, string> = {
  tl: "-top-[5.5px] -left-[5.5px]",
  tr: "-top-[5.5px] -right-[5.5px]",
  bl: "-bottom-[5.5px] -left-[5.5px]",
  br: "-bottom-[5.5px] -right-[5.5px]",
};

// L-bracket marker (system.css .bracket): 12x12px, two 1px borders in
// var(--bracket), offset -1px so the stroke sits flush to the corner.
const BRACKET_BASE = cn(
  "absolute size-[12px] pointer-events-none z-10",
  "border-0 border-solid border-[color:var(--bracket)]",
);

const BRACKET_CORNERS: Record<Corner, string> = {
  tl: "-top-px -left-px border-t border-l",
  tr: "-top-px -right-px border-t border-r",
  bl: "-bottom-px -left-px border-b border-l",
  br: "-bottom-px -right-px border-b border-r",
};

export function CornerMarkers({ variant = "cross", className }: CornerMarkersProps) {
  const base = variant === "bracket" ? BRACKET_BASE : CROSS_BASE;
  const corners = variant === "bracket" ? BRACKET_CORNERS : CROSS_CORNERS;

  return (
    <>
      {CORNERS.map((corner) => (
        <span key={corner} aria-hidden className={cn(base, corners[corner], className)} />
      ))}
    </>
  );
}
