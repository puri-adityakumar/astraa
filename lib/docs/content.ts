import "server-only";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { getDocsEntryBySlug, type DocsCatalogEntry } from "./catalog";

const DOC_SOURCE_PATHS: Readonly<Record<string, string>> = Object.freeze({
  overview: resolve(process.cwd(), "docs/README.md"),
  architecture: resolve(process.cwd(), "docs/ARCHITECTURE.md"),
  components: resolve(process.cwd(), "docs/COMPONENTS.md"),
  serverInterfaces: resolve(process.cwd(), "docs/API.md"),
  development: resolve(process.cwd(), "docs/DEVELOPMENT.md"),
  performance: resolve(process.cwd(), "docs/PERFORMANCE.md"),
  seo: resolve(process.cwd(), "docs/SEO.md"),
});

export interface FoundDocsContent {
  readonly entry: DocsCatalogEntry;
  readonly markdown: string;
  readonly status: "found";
}

interface MissingDocsContent {
  readonly status: "not-found";
}

export type DocsContentResult = FoundDocsContent | MissingDocsContent;

export async function loadDocsContent(slug: string): Promise<DocsContentResult> {
  const entry = getDocsEntryBySlug(slug);
  if (!entry) return { status: "not-found" };

  const sourcePath = DOC_SOURCE_PATHS[entry.sourceKey];
  if (!sourcePath) {
    throw new Error(`No allowlisted documentation source for key: ${entry.sourceKey}`);
  }

  return {
    entry,
    markdown: await readFile(sourcePath, "utf8"),
    status: "found",
  };
}

export function getAllowedDocsSourceKeys(): readonly string[] {
  return Object.freeze(Object.keys(DOC_SOURCE_PATHS));
}
