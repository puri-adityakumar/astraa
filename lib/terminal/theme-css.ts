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

/**
 * One scheme's declarations scoped twice: to the terminal root attribute
 * and, via :root:has, to the document root — portalled overlays (Radix
 * Select/Popover/Dialog/Tooltip, Toaster) render into document.body outside
 * the terminal root, so the vars must also resolve there (architecture §6
 * Portals). Legacy pages never contain the terminal marker, so their :root
 * tokens are untouched. `attr` is the attribute value to target ("auto"
 * differs from the scheme id providing the colours).
 */
function block(id: SchemeId, attr: string = id): string {
  const decls = declarations(id);
  return `[data-term-theme="${attr}"]{${decls}}` +
    `:root:has([data-flavour="terminal"][data-term-theme="${attr}"]){${decls}}`;
}

/**
 * All seven theme states: one block per explicit scheme (so switching the
 * attribute switches the colours instantly) plus auto — mocha by default,
 * latte inside the light system-preference media query.
 */
export function schemeCss(): string {
  const explicit = SCHEMES.map((scheme) => block(scheme.id)).join("");
  const autoBase = block(AUTO.dark, "auto");
  const autoLight = `${LIGHT_MEDIA_QUERY}{${block(AUTO.light, "auto")}}`;
  return explicit + autoBase + autoLight;
}
