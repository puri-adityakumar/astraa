import { cn } from "@/lib/utils";

// Thin-line "blueprint" SVG toppers — pure presentational, monochrome line-art
// inspired by polar.sh. Every stroke uses currentColor at strokeWidth 1 with
// non-scaling-stroke so they read as faint hairlines regardless of scale. The
// consumer controls color/opacity; the default wrapper tint is var(--faint),
// overridable via className. No state, no deps beyond react + cn.

interface BlueprintArtProps {
  className?: string;
}

// Shared <svg> wrapper. Stretches to the column width, fixed height, and is
// fully hidden from the accessibility tree (decorative only).
const SVG_BASE =
  "block w-full text-[color:hsl(var(--faint))]";

// Strokes inherit these so individual paths stay terse.
const STROKE = {
  stroke: "currentColor",
  strokeWidth: 1,
  fill: "none",
  vectorEffect: "non-scaling-stroke" as const,
};

// Two-to-three concentric circles with a small offset dot.
export function BlueprintRings({ className }: BlueprintArtProps) {
  return (
    <svg
      viewBox="0 0 240 104"
      width="100%"
      height={104}
      role="presentation"
      aria-hidden="true"
      className={cn(SVG_BASE, className)}
    >
      <circle cx={120} cy={52} r={40} {...STROKE} />
      <circle cx={120} cy={52} r={26} {...STROKE} />
      <circle cx={120} cy={52} r={12} {...STROKE} />
      <circle cx={120} cy={52} r={2.5} {...STROKE} fill="currentColor" />
      <circle cx={166} cy={28} r={3.5} {...STROKE} fill="currentColor" />
    </svg>
  );
}

// Lines radiating outward from a central point.
export function BlueprintRadiate({ className }: BlueprintArtProps) {
  const cx = 120;
  const cy = 52;
  const inner = 8;
  const outer = 44;
  const rays = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    return {
      x1: cx + dx * inner,
      y1: cy + dy * inner,
      x2: cx + dx * outer,
      y2: cy + dy * outer,
    };
  });

  return (
    <svg
      viewBox="0 0 240 104"
      width="100%"
      height={104}
      role="presentation"
      aria-hidden="true"
      className={cn(SVG_BASE, className)}
    >
      {rays.map((ray, i) => (
        <line key={i} x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2} {...STROKE} />
      ))}
      <circle cx={cx} cy={cy} r={4} {...STROKE} />
    </svg>
  );
}

// A loose grid of small plus / cross marks.
export function BlueprintCross({ className }: BlueprintArtProps) {
  const cols = 7;
  const rows = 3;
  const stepX = 32;
  const stepY = 30;
  const offX = 24;
  const offY = 22;
  const arm = 5;
  const marks: { cx: number; cy: number }[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      marks.push({ cx: offX + c * stepX, cy: offY + r * stepY });
    }
  }

  return (
    <svg
      viewBox="0 0 240 104"
      width="100%"
      height={104}
      role="presentation"
      aria-hidden="true"
      className={cn(SVG_BASE, className)}
    >
      {marks.map((mark, i) => (
        <g key={i}>
          <line
            x1={mark.cx - arm}
            y1={mark.cy}
            x2={mark.cx + arm}
            y2={mark.cy}
            {...STROKE}
          />
          <line
            x1={mark.cx}
            y1={mark.cy - arm}
            x2={mark.cx}
            y2={mark.cy + arm}
            {...STROKE}
          />
        </g>
      ))}
    </svg>
  );
}

// A few rightward arrow glyphs arranged in a loose grid (flow / direction).
export function BlueprintArrows({ className }: BlueprintArtProps) {
  const cols = 4;
  const rows = 2;
  const stepX = 56;
  const stepY = 44;
  const offX = 40;
  const offY = 30;
  const shaft = 22;
  const head = 6;
  const arrows: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      arrows.push({ x: offX + c * stepX, y: offY + r * stepY });
    }
  }

  return (
    <svg
      viewBox="0 0 240 104"
      width="100%"
      height={104}
      role="presentation"
      aria-hidden="true"
      className={cn(SVG_BASE, className)}
    >
      {arrows.map((arrow, i) => {
        const tip = arrow.x + shaft / 2;
        const tail = arrow.x - shaft / 2;
        return (
          <g key={i}>
            <line x1={tail} y1={arrow.y} x2={tip} y2={arrow.y} {...STROKE} />
            <line x1={tip} y1={arrow.y} x2={tip - head} y2={arrow.y - head} {...STROKE} />
            <line x1={tip} y1={arrow.y} x2={tip - head} y2={arrow.y + head} {...STROKE} />
          </g>
        );
      })}
    </svg>
  );
}
