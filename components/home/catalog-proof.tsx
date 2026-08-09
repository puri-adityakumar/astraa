import Link from "next/link";
import { ArrowRight, LockKeyhole, Network } from "lucide-react";

import { HOME_CATALOG_COUNTS, HOME_PLANNED_GAMES, HOME_PLANNED_TOOLS } from "./home-content";

export function CatalogProof() {
  return (
    <div className="-mx-4 grid border-b sm:-mx-6 lg:-mx-8 lg:grid-cols-2">
      <section
        className="border-b px-5 py-12 sm:px-8 sm:py-16 lg:border-b-0 lg:border-r lg:px-12 lg:py-20"
        aria-labelledby="data-boundary-title"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Data boundaries
        </p>
        <h2 id="data-boundary-title" className="mt-3">
          Know what stays and what leaves.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          Local utilities keep their working input in this browser. The provider-backed tools
          disclose the server and network step in their interface and guidance.
        </p>

        <dl className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 shadow-geist">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              In-browser tools
            </dt>
            <dd className="mt-3 text-3xl font-semibold tracking-[-0.045em]">
              {HOME_CATALOG_COUNTS.local}
            </dd>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-geist">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <Network className="h-4 w-4" aria-hidden="true" />
              Provider-backed tools
            </dt>
            <dd className="mt-3 text-3xl font-semibold tracking-[-0.045em]">
              {HOME_CATALOG_COUNTS.providerBacked}
            </dd>
          </div>
        </dl>

        <Link
          href="/privacy"
          className="mt-6 inline-flex min-h-touch items-center gap-1.5 rounded-md text-sm font-medium underline decoration-border underline-offset-4"
        >
          Read privacy and data handling
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </section>

      <section
        className="px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20"
        aria-labelledby="catalog-title"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Catalog status
        </p>
        <h2 id="catalog-title" className="mt-3">
          Available now. Planned stays planned.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          {HOME_CATALOG_COUNTS.available} tools are ready to open.{" "}
          {formatAvailableGameCount(HOME_CATALOG_COUNTS.availableGames)} The entries below remain
          visible as plans, not launchable products.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <PlannedList title="Planned tools" entries={HOME_PLANNED_TOOLS} />
          <PlannedList title="Planned games" entries={HOME_PLANNED_GAMES} />
        </div>

        <Link
          href="/explore"
          className="mt-7 inline-flex min-h-touch items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
        >
          View the combined catalog
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}

function formatAvailableGameCount(count: number): string {
  return `${count} browser ${count === 1 ? "game is" : "games are"} playable now.`;
}

interface PlannedListProps {
  entries: readonly { id: string; name: string }[];
  title: string;
}

function PlannedList({ entries, title }: PlannedListProps) {
  return (
    <div>
      <h3 className="text-sm tracking-normal">
        {title} · {entries.length}
      </h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="rounded-full border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground"
            data-home-planned-entry={entry.id}
          >
            {entry.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
