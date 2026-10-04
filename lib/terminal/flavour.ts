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
 * Whether reloading the given pathname with the terminal flavour serves the
 * terminal: the home page, the tools index, or a tool whose slug is
 * registered in TERMINAL_TOOL_SLUGS. Anything else (always-legacy routes,
 * unregistered slugs) must navigate to "/" instead.
 */
export function isTerminalCapablePath(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (path === "/" || path === "/tools") return true;
  if (path.startsWith("/tools/")) {
    return isTerminalToolSlug(path.slice("/tools/".length));
  }
  return false;
}
