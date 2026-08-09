import Link from "next/link";

import type { DocsCatalogEntry } from "@/lib/docs/catalog";

interface DocsBreadcrumbsProps {
  current: DocsCatalogEntry;
}

export function DocsBreadcrumbs({ current }: DocsBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 overflow-x-auto">
      <ol className="flex min-w-max items-center gap-2 text-sm text-muted-foreground">
        <li>
          <Link className="inline-flex min-h-touch items-center hover:text-foreground" href="/">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        {current.route === "/docs" ? (
          <li aria-current="page" className="text-foreground">
            Docs
          </li>
        ) : (
          <>
            <li>
              <Link
                className="inline-flex min-h-touch items-center hover:text-foreground"
                href="/docs"
              >
                Docs
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="max-w-52 truncate text-foreground">
              {current.title}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
