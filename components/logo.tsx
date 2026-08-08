import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

function AstraaMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 2.5 14.6 9.4 21.5 12l-6.9 2.6L12 21.5l-2.6-6.9L2.5 12l6.9-2.6L12 2.5Z"
        fill="currentColor"
      />
      <circle cx="12" cy="12" fill="hsl(var(--background))" r="2.1" />
    </svg>
  );
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex min-h-touch items-center gap-2.5 rounded-md text-foreground " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label="Astraa home"
    >
      <AstraaMark />
      <span className="text-[15px] font-semibold tracking-[-0.03em]">astraa</span>
      <span className="border-l pl-2 font-mono text-[11px] text-muted-foreground">
        अस्त्र
      </span>
    </Link>
  );
}
