/**
 * Tool slugs served by the terminal flavour, gated per milestone.
 * proxy.ts rewrites /tools/<slug> to the terminal only when the slug is
 * listed here; the terminal [tool] route uses the same list. Dependency-free
 * so the proxy bundle stays small.
 */
export const TERMINAL_TOOL_SLUGS = [
  "calculator",
  "units",
  "base64",
  "hash",
  "regex",
  "json",
  "password",
] as const;

export type TerminalToolSlug = (typeof TERMINAL_TOOL_SLUGS)[number];

export function isTerminalToolSlug(slug: string): slug is TerminalToolSlug {
  return (TERMINAL_TOOL_SLUGS as readonly string[]).includes(slug);
}
