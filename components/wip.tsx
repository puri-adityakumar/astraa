import Link from "next/link";
import { ArrowRight, Construction } from "lucide-react";

import { Button } from "@/components/ui/button";

interface WorkInProgressProps {
  name: string;
  kind: "game" | "tool";
}

export function WorkInProgress({ name, kind }: WorkInProgressProps) {
  const categoryPath = kind === "game" ? "/games" : "/tools";

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-12">
      <div className="site-dots w-full max-w-2xl rounded-xl border p-8 text-center shadow-geist sm:p-14">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md border bg-background">
          <Construction className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Planned {kind}
        </p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{name} is planned</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
          This {kind} is not available yet. Browse what is ready now instead.
        </p>
        <div className="mx-auto mt-7 flex max-w-sm flex-col gap-2 sm:max-w-none sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href={categoryPath} className="group w-full gap-2 sm:w-auto">
              Browse available {kind}s
              <ArrowRight
                className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/explore" className="w-full sm:w-auto">
              View full catalog
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
