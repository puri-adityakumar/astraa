/**
 * Shared JSON-key/identifier helpers for the codegen generators and path utils.
 * Consolidated from the former per-generator duplicates (LJ-04).
 */

/** Regex matching a safe bare JS/TS identifier key (no quoting required). */
export const SAFE_KEY = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/** True when `key` is a bare identifier that needs no JSON-quoting. */
export function isSafeIdentifier(key: string): boolean {
  return SAFE_KEY.test(key);
}

/** Convert an arbitrary string into a PascalCase type name; "Root" for empty/falsy input. */
export function pascalCase(s: string): string {
  if (!s) return "Root";
  const cleaned = s.replace(/[^A-Za-z0-9_]/g, " ");
  return (
    cleaned
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("") || "Root"
  );
}
