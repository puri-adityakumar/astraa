import rawCatalog from "./catalog.json";

export interface DocsCatalogEntry {
  readonly description: string;
  readonly order: number;
  readonly route: string;
  readonly slug: string;
  readonly source: string;
  readonly sourceKey: string;
  readonly title: string;
}

export interface ResolvedDocsLink {
  readonly href?: string;
  readonly kind: "anchor" | "external" | "internal" | "rejected";
}

export const DOCS_CATALOG: readonly DocsCatalogEntry[] = Object.freeze(
  rawCatalog.documents.map((entry) => Object.freeze({ ...entry })),
);

export const DOCS_PATHS: readonly string[] = Object.freeze(
  DOCS_CATALOG.map((entry) => entry.route),
);

export const DOCS_CHILDREN: readonly DocsCatalogEntry[] = Object.freeze(
  DOCS_CATALOG.filter((entry) => entry.slug !== ""),
);

const docsOverview = DOCS_CATALOG.find((entry) => entry.slug === "");
if (!docsOverview) throw new Error("Documentation catalog is missing its overview entry.");
export const DOCS_OVERVIEW: DocsCatalogEntry = docsOverview;

export function getDocsEntryBySlug(slug: string): DocsCatalogEntry | undefined {
  return DOCS_CATALOG.find((entry) => entry.slug === slug);
}

export function getDocsEntryByRoute(route: string): DocsCatalogEntry | undefined {
  return DOCS_CATALOG.find((entry) => entry.route === route);
}

export function resolveDocsLink(href: string, sourceKey: string): ResolvedDocsLink {
  const value = href.trim();
  if (value === "" || value.startsWith("//") || value.includes("\\")) {
    return { kind: "rejected" };
  }

  if (value.startsWith("#")) {
    return value.length > 1 ? { href: value, kind: "anchor" } : { kind: "rejected" };
  }

  if (value.startsWith("/")) {
    return value.startsWith("/docs") || !value.includes(":")
      ? { href: value, kind: "internal" }
      : { kind: "rejected" };
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return resolveRelativeDocsLink(value, sourceKey);
  }

  return url.protocol === "http:" || url.protocol === "https:"
    ? { href: url.href, kind: "external" }
    : { kind: "rejected" };
}

function resolveRelativeDocsLink(href: string, sourceKey: string): ResolvedDocsLink {
  const sourceEntry = DOCS_CATALOG.find((entry) => entry.sourceKey === sourceKey);
  if (!sourceEntry) return { kind: "rejected" };

  const [pathWithQuery, fragment] = splitOnce(href, "#");
  const [rawPath, query] = splitOnce(pathWithQuery, "?");
  if (query !== undefined || rawPath === "") return { kind: "rejected" };

  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch {
    return { kind: "rejected" };
  }

  const withoutCurrentPrefix = decodedPath.replace(/^(?:\.\/)+/, "");
  if (
    withoutCurrentPrefix === "" ||
    withoutCurrentPrefix.split("/").some((segment) => segment === "." || segment === "..") ||
    !withoutCurrentPrefix.endsWith(".md")
  ) {
    return { kind: "rejected" };
  }

  const sourceDirectory = sourceEntry.source.slice(0, sourceEntry.source.lastIndexOf("/") + 1);
  const targetSource = `${sourceDirectory}${withoutCurrentPrefix}`;
  const targetEntry = DOCS_CATALOG.find((entry) => entry.source === targetSource);
  if (!targetEntry) return { kind: "rejected" };

  const hash = fragment === undefined || fragment === "" ? "" : `#${fragment}`;
  return { href: `${targetEntry.route}${hash}`, kind: "internal" };
}

function splitOnce(value: string, separator: string): [string, string | undefined] {
  const index = value.indexOf(separator);
  return index === -1 ? [value, undefined] : [value.slice(0, index), value.slice(index + 1)];
}
