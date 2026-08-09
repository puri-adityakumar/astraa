import Link from "next/link";

import { DOCS_CATALOG, type DocsCatalogEntry } from "@/lib/docs/catalog";
import { cn } from "@/lib/utils";

interface DocsNavigationProps {
  current: DocsCatalogEntry;
}

export function DocsNavigation({ current }: DocsNavigationProps) {
  return (
    <>
      <details className="mb-8 rounded-lg border bg-card lg:hidden">
        <summary className="flex min-h-touch cursor-pointer items-center px-4 py-3 text-sm font-medium">
          Documentation pages: {current.title}
        </summary>
        <nav aria-label="Documentation pages" className="border-t p-2">
          <DocsNavigationLinks current={current} />
        </nav>
      </details>

      <nav
        aria-label="Documentation pages"
        className="sticky top-24 hidden self-start rounded-lg border bg-card p-2 lg:block"
      >
        <p className="px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Documentation
        </p>
        <DocsNavigationLinks current={current} />
      </nav>
    </>
  );
}

function DocsNavigationLinks({ current }: DocsNavigationProps) {
  return (
    <ul className="grid gap-1">
      {DOCS_CATALOG.map((entry) => {
        const isCurrent = entry.route === current.route;
        return (
          <li key={entry.route}>
            <Link
              href={entry.route}
              className={cn(
                "flex min-h-touch items-center rounded-md px-3 py-2 text-sm text-muted-foreground " +
                  "transition-colors hover:bg-muted hover:text-foreground",
                isCurrent && "bg-muted font-medium text-foreground",
              )}
              aria-current={isCurrent ? "page" : undefined}
            >
              {entry.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
