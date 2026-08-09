import Link from "next/link";

import { DOCS_CATALOG, type DocsCatalogEntry } from "@/lib/docs/catalog";

interface DocsPaginationProps {
  current: DocsCatalogEntry;
}

export function DocsPagination({ current }: DocsPaginationProps) {
  const currentIndex = DOCS_CATALOG.findIndex((entry) => entry.route === current.route);
  const previous = currentIndex > 0 ? DOCS_CATALOG[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 ? DOCS_CATALOG[currentIndex + 1] : undefined;

  return (
    <nav
      aria-label="Documentation pagination"
      className="mt-12 grid gap-3 border-t pt-8 sm:grid-cols-2"
    >
      {previous ? <PaginationLink direction="Previous" entry={previous} /> : <span />}
      {next ? <PaginationLink direction="Next" entry={next} alignRight /> : <span />}
    </nav>
  );
}

interface PaginationLinkProps {
  alignRight?: boolean;
  direction: "Next" | "Previous";
  entry: DocsCatalogEntry;
}

function PaginationLink({ alignRight = false, direction, entry }: PaginationLinkProps) {
  return (
    <Link
      href={entry.route}
      className={
        "flex min-h-touch flex-col justify-center rounded-lg border p-4 transition-colors " +
        "hover:bg-muted " +
        (alignRight ? "sm:text-right" : "")
      }
    >
      <span className="text-xs text-muted-foreground">{direction}</span>
      <span className="mt-1 text-sm font-medium">{entry.title}</span>
    </Link>
  );
}
