import type { ReactNode } from "react";
import { Construction } from "lucide-react";

interface WorkInProgressProps {
  children?: ReactNode;
}

export function WorkInProgress({ children }: WorkInProgressProps) {
  const showWip = process.env.NEXT_PUBLIC_ENV === "prod";

  if (!showWip) return <>{children}</>;

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-12">
      <div className="site-dots w-full max-w-2xl rounded-xl border p-8 text-center shadow-geist sm:p-14">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md border bg-background">
          <Construction className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Work in progress
        </p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Under construction.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
          This part of Astraa is still being assembled. Check back after the next
          release.
        </p>
      </div>
    </div>
  );
}
