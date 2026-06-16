import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { CornerMarkers } from "@/components/ui/corner-marker";

import type { LucideIcon } from "lucide-react";

interface TCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  href?: string;
  tag?: string;
  soon?: boolean;
  isHover?: boolean;
  className?: string;
}

// Blueprint card (system.css .tcard) reproduced verbatim. The hover lift and
// arrow nudge are gated behind motion-reduce; isHover mirrors hover for
// keyboard/active states. Renders as a Link when href is given, else a div.
export function TCard({
  icon: Icon,
  title,
  desc,
  href,
  tag,
  soon = false,
  isHover = false,
  className,
}: TCardProps) {
  const cardClass = cn(
    "tcard group relative flex flex-col p-5 bg-[hsl(var(--card))]",
    "border border-[color:var(--hairline)] rounded-[var(--radius)]",
    "transition-[border-color,background-color,box-shadow,transform] duration-200",
    "outline-none",
    "focus-visible:ring-2 focus-visible:ring-[color:hsl(var(--ring))] focus-visible:ring-offset-0",
    // hover state
    "hover:border-[color:var(--hairline-strong)] hover:bg-[hsl(var(--surface-3))]",
    "hover:shadow-card motion-safe:hover:-translate-y-0.5",
    // mirrored is-hover state
    isHover && cn(
      "border-[color:var(--hairline-strong)] bg-[hsl(var(--surface-3))] shadow-card",
      "motion-safe:-translate-y-0.5",
    ),
    soon && "opacity-55",
    className,
  );

  const iconBoxClass = cn(
    "flex items-center justify-center mb-4 size-[38px]",
    "border border-[color:var(--hairline)] rounded-[8px]",
    "bg-[hsl(var(--surface-2))] text-foreground",
    "transition-[border-color] duration-200",
    "group-hover:border-[color:var(--hairline-strong)]",
    isHover && "border-[color:var(--hairline-strong)]",
  );

  const arrowClass = cn(
    "size-4 text-[color:hsl(var(--faint))]",
    "transition-[transform,color] duration-200",
    "group-hover:text-foreground motion-safe:group-hover:translate-x-0.5",
    "motion-safe:group-hover:-translate-y-0.5",
    isHover && cn(
      "text-foreground",
      "motion-safe:translate-x-0.5 motion-safe:-translate-y-0.5",
    ),
  );

  const content = (
    <>
      <CornerMarkers />
      <div className={iconBoxClass} aria-hidden>
        <Icon className="size-[19px]" strokeWidth={1.7} />
      </div>
      <h4 className="mb-[5px] text-[15px] font-semibold tracking-[-0.015em] text-foreground">
        {title}
      </h4>
      <p className="text-[13px] leading-[1.45] tracking-[-0.005em] text-muted-foreground">
        {desc}
      </p>
      <div
        className={cn(
          "foot flex items-center justify-between mt-4 pt-[14px]",
          "border-t border-dashed border-[color:var(--hairline)]",
        )}
      >
        {tag ? (
          <span
            className={cn(
              "font-mono text-[10px] font-medium leading-[1.3] uppercase tracking-[0.14em]",
              "px-[6px] py-0.5 whitespace-nowrap text-muted-foreground",
              "border border-[color:var(--hairline)] rounded-[4px]",
            )}
          >
            {tag}
          </span>
        ) : (
          <span aria-hidden />
        )}
        <ArrowUpRight className={arrowClass} aria-hidden />
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return <div className={cardClass}>{content}</div>;
}
