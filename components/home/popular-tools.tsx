import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HOME_FEATURED_TOOLS } from "./home-content";

export function PopularTools() {
  return (
    <section
      className="-mx-4 border-b px-5 py-12 sm:-mx-6 sm:px-8 sm:py-16 lg:-mx-8 lg:px-12 lg:py-20"
      aria-labelledby="popular-tools-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Available now
          </p>
          <h2 id="popular-tools-title" className="mt-3">
            Start with a proven utility.
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          Every card comes directly from the live catalog, including its processing boundary and
          canonical tool route.
        </p>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {HOME_FEATURED_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const processingLabel = tool.processing === "local" ? "In browser" : "Provider-backed";

          return (
            <Link
              key={tool.id}
              href={tool.path}
              prefetch={false}
              className="group min-h-touch rounded-xl border bg-card p-5 shadow-geist transition-colors hover:border-foreground/20 hover:bg-muted/30 focus-visible:bg-muted/30 sm:p-6"
              data-home-tool-card={tool.id}
            >
              <span className="flex items-start justify-between gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {processingLabel}
                </span>
              </span>
              <div className="mt-5 flex items-center justify-between gap-3">
                <h3 className="text-lg tracking-[-0.025em]">{tool.name}</h3>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{tool.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
