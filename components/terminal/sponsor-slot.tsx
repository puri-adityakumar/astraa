import {
  SPONSOR,
  SPONSOR_CONTACT_HREF,
  type Sponsor,
} from "@/lib/terminal/sponsor";
import { cn } from "@/lib/utils";

interface SponsorSlotProps {
  compact?: boolean;
  sponsor?: Sponsor | null;
}

export function SponsorSlot({ compact = false, sponsor = SPONSOR }: SponsorSlotProps) {
  return (
    <section aria-label="Sponsor" className="space-y-2">
      <h2 className="font-mono text-xs text-term-muted">Sponsor</h2>
      {sponsor === null ? (
        <a
          href={SPONSOR_CONTACT_HREF}
          className={cn(
            "flex min-h-touch flex-col items-center justify-center gap-2 rounded-lg",
            "border border-dashed border-term-surface2 px-3 text-center font-mono",
            "hover:bg-term-surface2 focus-visible:bg-term-surface2",
            compact ? "h-28" : "h-40",
          )}
        >
          <span className="text-sm text-term-muted">Your brand here</span>
          <span className="text-xs text-term-accent">Sponsor astraa &rarr;</span>
        </a>
      ) : (
        <a
          href={sponsor.href}
          target="_blank"
          rel="sponsored noopener"
          className={cn(
            "flex min-h-touch flex-col items-center justify-center gap-2 rounded-lg",
            "border border-term-surface2 px-3 py-4 text-center font-mono",
            "hover:bg-term-surface2 focus-visible:bg-term-surface2",
            compact ? "min-h-28" : "min-h-40",
          )}
        >
          {/* Sponsor assets can be hosted externally without changing Next image configuration. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sponsor.logoSrc}
            alt={sponsor.logoAlt}
            width={120}
            height={40}
            className="h-10 max-w-full object-contain"
            loading="lazy"
          />
          <span className="text-sm text-term-fg">{sponsor.name}</span>
          <span className="text-xs text-term-muted">{sponsor.tagline}</span>
        </a>
      )}
    </section>
  );
}
