/**
 * Pure helpers for the cookies around the terminal flavour. No React, no
 * next/* imports — safe for the proxy bundle and unit tests (node env).
 *
 * The two persisted terminal-state cookies are `astraa_flavour` and
 * `astraa_term_theme`; `astraa_visited` is the visitor-counter cookie set by
 * proxy.ts. Unknown/garbage values parse to the defaults (terminal, auto).
 */

export const FLAVOUR_COOKIE_NAME = "astraa_flavour";
export const TERM_THEME_COOKIE_NAME = "astraa_term_theme";
export const VISITED_COOKIE_NAME = "astraa_visited";

export const FLAVOUR_TERMINAL = "terminal";
export const FLAVOUR_LEGACY = "legacy";

export type Flavour = typeof FLAVOUR_TERMINAL | typeof FLAVOUR_LEGACY;

export type TermTheme =
  | "auto"
  | "mocha"
  | "dracula"
  | "tokyo-night"
  | "latte"
  | "solarized-light"
  | "rose-pine-dawn";

export const TERM_THEME_AUTO: TermTheme = "auto";

export const TERM_THEMES: readonly TermTheme[] = [
  "auto",
  "mocha",
  "dracula",
  "tokyo-night",
  "latte",
  "solarized-light",
  "rose-pine-dawn",
];

/** One year, per the architecture's cookie table. */
export const FLAVOUR_COOKIE_MAX_AGE = 31536000;
export const TERM_THEME_COOKIE_MAX_AGE = 31536000;

/** Visitor dedup window: 24 hours. */
export const VISITED_COOKIE_MAX_AGE = 60 * 60 * 24;

const FLAVOUR_COOKIE_ATTRIBUTES = "path=/; max-age=31536000; samesite=lax";
const TERM_THEME_COOKIE_ATTRIBUTES = "path=/; max-age=31536000; samesite=lax";

/** Missing and garbage values resolve to the default flavour (terminal). */
export function parseFlavour(value: string | undefined | null): Flavour {
  return value === FLAVOUR_LEGACY ? FLAVOUR_LEGACY : FLAVOUR_TERMINAL;
}

export function isTermTheme(value: unknown): value is TermTheme {
  return (
    typeof value === "string" &&
    (TERM_THEMES as readonly string[]).includes(value)
  );
}

/** Missing and garbage values resolve to the default theme (auto). */
export function parseTermTheme(value: string | undefined | null): TermTheme {
  return isTermTheme(value) ? value : TERM_THEME_AUTO;
}

/** document.cookie string for switching flavour (never httpOnly). */
export function serializeFlavourCookie(flavour: Flavour): string {
  return `${FLAVOUR_COOKIE_NAME}=${flavour}; ${FLAVOUR_COOKIE_ATTRIBUTES}`;
}

/** document.cookie string for switching terminal theme (never httpOnly). */
export function serializeTermThemeCookie(theme: TermTheme): string {
  return `${TERM_THEME_COOKIE_NAME}=${theme}; ${TERM_THEME_COOKIE_ATTRIBUTES}`;
}
