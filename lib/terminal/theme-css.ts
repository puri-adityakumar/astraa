/**
 * Temporary theme variables for the terminal shell: the default scheme's
 * colours as CSS custom properties on the terminal root, with `auto`
 * behaviour via a light-system-preference media query. Values come from
 * themes.ts (never copied) — replaced by [data-term-theme] blocks when the
 * colour-scheme feature wires the cookie.
 */
import { getScheme, type SchemeColors, type SchemeId } from "./themes";

/** Terminal CSS custom property for each SchemeColors key. */
export const TERM_CSS_VARS: Record<keyof SchemeColors, string> = {
  bg: "--term-bg",
  surface: "--term-surface",
  surface2: "--term-surface2",
  fg: "--term-fg",
  muted: "--term-muted",
  accent: "--term-accent",
  green: "--term-green",
  red: "--term-red",
  yellow: "--term-yellow",
  cyan: "--term-cyan",
};

const TERM_ROOT_SELECTOR = '[data-flavour="terminal"]';
const LIGHT_MEDIA_QUERY = "@media (prefers-color-scheme: light)";

function declarations(id: SchemeId): string {
  const colors = getScheme(id).colors;
  return (Object.keys(TERM_CSS_VARS) as Array<keyof SchemeColors>)
    .map((key) => `${TERM_CSS_VARS[key]}: ${colors[key]};`)
    .join("");
}

function block(selector: string, id: SchemeId): string {
  return `${selector}{${declarations(id)}}`;
}

/** Mocha by default; latte when the system prefers light colours. */
export function autoThemeCss(): string {
  return (
    block(TERM_ROOT_SELECTOR, "mocha") +
    `${LIGHT_MEDIA_QUERY}{${block(TERM_ROOT_SELECTOR, "latte")}}`
  );
}
