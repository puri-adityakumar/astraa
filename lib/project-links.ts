import rawProjectLinks from "./project-links.json";

export interface ProjectLink {
  readonly key: string;
  readonly kind: "external" | "internal";
  readonly label: string;
  readonly readmeHref: string | null;
  readonly siteHref: string;
}

export const PROJECT_LINKS: readonly ProjectLink[] = Object.freeze(
  rawProjectLinks.links.map((link) =>
    Object.freeze({
      ...link,
      kind: link.kind as ProjectLink["kind"],
    }),
  ),
);

export function getProjectLink(key: string): ProjectLink | undefined {
  return PROJECT_LINKS.find((link) => link.key === key);
}
