import Link from "next/link";

import { cn } from "@/lib/utils";

interface SectionAction {
  href: string;
  label: string;
}

interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  action?: SectionAction;
  className?: string;
}

// Shared opacity for the hairline tick — keeps the eyebrow ticks in sync with
// the hardcoded 0.55 literals in the existing home sections.
const TICK_OPACITY = 0.55;

// Bare hairline tick that precedes the mono eyebrow label (system.css). Exposed
// standalone so callers can reuse the exact same tick element + opacity value.
export function SectionDivider({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block w-[18px] h-px bg-foreground", className)}
      style={{ opacity: TICK_OPACITY }}
      aria-hidden="true"
    />
  );
}

// Reusable section header matching the existing home look: a mono eyebrow
// (tick + uppercase label) above an h2 title, with an optional muted
// description rendered to the right on lg+ (stacked on mobile) and an optional
// right-aligned action link mirroring popular-section's "View all tools".
export function SectionHeader({
  label,
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  const heading = (
    <div className="flex flex-col gap-3">
      <span
        className={cn(
          "inline-flex items-center gap-[9px]",
          "font-mono text-[11px] font-medium tracking-[0.2em] uppercase",
          "text-muted-foreground",
        )}
      >
        <SectionDivider />
        {label}
      </span>
      <h2 className="text-[clamp(24px,3.4vw,32px)] font-bold tracking-[-0.03em] leading-[1.1]">
        {title}
      </h2>
    </div>
  );

  const actionLink = action ? (
    <Link
      href={action.href}
      className={cn(
        "inline-flex items-center gap-[6px] shrink-0",
        "font-mono text-[11px] tracking-[0.1em] uppercase text-muted-foreground",
        "hover:text-foreground transition-colors duration-150",
      )}
    >
      {action.label}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[13px] h-[13px]"
        aria-hidden="true"
      >
        <path d="M7 17L17 7M9 7h8v8" />
      </svg>
    </Link>
  ) : null;

  // Polar-style two-column: title left, description right on lg+, stacked on
  // mobile. Falls back to the popular-section head row when no description.
  if (description) {
    return (
      <div
        className={cn(
          "flex flex-col gap-6 mb-[26px]",
          "lg:flex-row lg:items-end lg:justify-between lg:gap-12",
          className,
        )}
      >
        {heading}
        <div className="flex flex-col gap-3 lg:items-end lg:max-w-[420px]">
          <p
            className={cn(
              "text-[length:clamp(14px,1.4vw,16px)] leading-[1.55] tracking-[-0.01em]",
              "text-muted-foreground lg:text-right",
            )}
          >
            {description}
          </p>
          {actionLink}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-end justify-between gap-4 mb-[26px]", className)}>
      {heading}
      {actionLink}
    </div>
  );
}
