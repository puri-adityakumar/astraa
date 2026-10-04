/**
 * Input parser for the terminal. Pure string handling: trims, splits the
 * command name from the args at the first whitespace, and preserves the case
 * and inner spacing of args. Matching against the registry is done later,
 * case-insensitively (registry.ts).
 */
export type ParsedInput =
  | { kind: "empty" }
  | { kind: "text"; text: string }
  | { kind: "command"; name: string; args: string; raw: string };

export function parseInput(raw: string): ParsedInput {
  const trimmed = raw.trim();
  if (trimmed === "") return { kind: "empty" };
  if (!trimmed.startsWith("/")) return { kind: "text", text: trimmed };
  const body = trimmed.slice(1);
  const name = body.split(/\s/, 1)[0] ?? "";
  const args = body.slice(name.length).trim();
  return { kind: "command", name, args, raw: trimmed };
}
