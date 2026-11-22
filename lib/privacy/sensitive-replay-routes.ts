/**
 * Routes whose pages can display secrets the user never chose to share:
 * generated passwords, hashes of user-provided text, and user text input.
 * Session replay must not record while one of these pages is open (#96).
 */
export const SENSITIVE_REPLAY_ROUTES = [
  "/tools/password",
  "/tools/hash",
  "/tools/text",
] as const;

/** Strips trailing slashes so "/tools/password/" compares equal to "/tools/password". */
function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/**
 * Whether session replay must be off for this pathname. Exact match on the
 * public URL — the terminal panel serves the same path, so both flavours
 * are covered by one check.
 */
export function isSensitiveReplayRoute(pathname: string): boolean {
  return (SENSITIVE_REPLAY_ROUTES as readonly string[]).includes(
    normalizePath(pathname),
  );
}
