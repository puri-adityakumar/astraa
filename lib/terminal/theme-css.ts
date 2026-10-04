/**
 * CSS custom properties for the terminal colour schemes, generated from
 * themes.ts (never copied). Each scheme maps to a `[data-term-theme="<id>"]`
 * block on the terminal root holding both the terminal `--term-*` variables
 * and the shadcn HSL tokens, so tool clients inside panels adopt the scheme.
 * `auto` (the default) renders mocha and switches to latte under the light
 * system preference.
 */
import {
  AUTO,
  SCHEMES,
  getScheme,
  shadcnTokens,
  type SchemeColors,
  type SchemeId,
} from "./themes";

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

const LIGHT_MEDIA_QUERY = "@media (prefers-color-scheme: light)";

function declarations(id: SchemeId): string {
  const scheme = getScheme(id);
  let css = "";
  for (const key of Object.keys(TERM_CSS_VARS) as Array<keyof SchemeColors>) {
    css += `${TERM_CSS_VARS[key]}: ${scheme.colors[key]};`;
  }
  const tokens = shadcnTokens(id);
  for (const token of Object.keys(tokens) as Array<keyof typeof tokens>) {
    css += `--${token}: ${tokens[token]};`;
  }
  return css;
}

function block(id: SchemeId): string {
  return `[data-term-theme="${id}"]{${declarations(id)}}`;
}

/**
 * All seven theme states: one block per explicit scheme (so switching the
 * attribute switches the colours instantly) plus auto — mocha by default,
 * latte inside the light system-preference media query.
 */
export function schemeCss(): string {
  const explicit = SCHEMES.map((scheme) => block(scheme.id)).join("");
  const autoBase = `[data-term-theme="auto"]{${declarations(AUTO.dark)}}`;
  const autoLight = `${LIGHT_MEDIA_QUERY}{[data-term-theme="auto"]{${declarations(
    AUTO.light,
  )}}}`;
  return explicit + autoBase + autoLight;
}
