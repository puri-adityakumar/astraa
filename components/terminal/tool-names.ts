import { tools } from "@/lib/tools";

/**
 * Human-readable tool name for a slug, looked up from the legacy tool
 * registry; unknown slugs fall back to a title-cased slug.
 */
export function toolDisplayName(slug: string): string {
  const tool = tools.find((entry) => entry.path === `/tools/${slug}`);
  if (tool) return tool.name;
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
