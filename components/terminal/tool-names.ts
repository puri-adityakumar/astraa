import type { ToolSlug } from "@/lib/terminal/types";
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

/**
 * Compact names for the fixed-width sidebar rail, where every label must
 * fit beside a compact command chip without truncating.
 */
const SHORT_NAMES: Record<ToolSlug, string> = {
  calculator: "Calculator",
  units: "Units",
  base64: "Base64",
  hash: "Hash",
  regex: "Regex",
  json: "JSON",
  password: "Password",
  currency: "Currency",
  text: "Lorem Ipsum",
  image: "Image",
  markdown: "Markdown",
  "snippet-generator": "Snippet",
  music: "Lofi",
  sql: "SQL",
};

/** Short rail name for a tool slug; exhaustive over the terminal slugs. */
export function toolShortName(slug: ToolSlug): string {
  return SHORT_NAMES[slug];
}
