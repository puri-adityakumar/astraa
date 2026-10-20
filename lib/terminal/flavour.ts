/**
 * Pure helpers for flavour switching decisions. No React, no DOM — the
 * navigation glue lives in the client components that import these.
 */
import { isTerminalToolSlug } from "./slugs";

/** Strips trailing slashes so "/tools/" and "/tools" compare equal. */
function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/**
 * The internal terminal route that serves `pathname` (/, /tools or a
 * registered /tools/<slug>, trailing-slash tolerant), or null when the
 * path must fall through to the legacy pages. This is the single source of
 * truth for terminal-capable paths: proxy.ts rewrites to the returned
 * route, and isTerminalCapablePath derives its predicate from it.
 */
export function terminalRewritePath(pathname: string): string | null {
  const path = normalizePath(pathname);
  if (path === "/" || path === "/tools") return "/terminal";
  if (path.startsWith("/tools/")) {
    const slug = path.slice("/tools/".length);
    if (isTerminalToolSlug(slug)) {
      return `/terminal/tools/${slug}`;
    }
  }
  return null;
}

/**
 * Whether reloading the given pathname with the terminal flavour serves the
 * terminal: the home page, the tools index, or a tool whose slug is
 * registered in TERMINAL_TOOL_SLUGS. Anything else (always-legacy routes,
 * unregistered slugs) must navigate to "/" instead.
 */
export function isTerminalCapablePath(pathname: string): boolean {
  return terminalRewritePath(pathname) !== null;
}
