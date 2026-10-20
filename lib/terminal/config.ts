import { TERM_THEME_AUTO, TERM_THEMES, type TermTheme } from "./cookies";

export type ConfigRequest =
  | { kind: "open" }
  | { kind: "theme"; name: string }
  | { kind: "legacy" }
  | { kind: "invalid" };

export function parseConfigArgs(args: string): ConfigRequest {
  const normalized = args.trim().toLowerCase();
  if (normalized === "") return { kind: "open" };

  const [command, ...values] = normalized.split(/\s+/);
  if (command === "theme") return { kind: "theme", name: values.join(" ") };
  if (command === "legacy" && values.length === 0) return { kind: "legacy" };
  if (command === "interface" && values.length === 1 && values[0] === "legacy") {
    return { kind: "legacy" };
  }
  return { kind: "invalid" };
}

export function cycleTermTheme(current: string, direction: 1 | -1): TermTheme {
  const normalized = current.trim().toLowerCase();
  const index = TERM_THEMES.findIndex((theme) => theme === normalized);
  if (index === -1) return TERM_THEME_AUTO;
  const next = (index + direction + TERM_THEMES.length) % TERM_THEMES.length;
  return TERM_THEMES[next] ?? TERM_THEME_AUTO;
}
