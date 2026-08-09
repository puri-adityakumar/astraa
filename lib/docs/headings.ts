export interface HeadingSlugger {
  slug: (heading: string) => string;
}

export function createHeadingSlugger(): HeadingSlugger {
  const occurrences = new Map<string, number>();

  return {
    slug(heading: string): string {
      const base = slugifyHeading(heading);
      const occurrence = occurrences.get(base) ?? 0;
      occurrences.set(base, occurrence + 1);
      return occurrence === 0 ? base : `${base}-${occurrence}`;
    },
  };
}

export function slugifyHeading(heading: string): string {
  const slug = heading
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");

  return slug || "section";
}

export function createDiagramId(source: string, occurrence = 0): string {
  let hash = 2_166_136_261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }

  return `docs-mermaid-${(hash >>> 0).toString(36)}-${occurrence}`;
}
