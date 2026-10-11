/**
 * The six terminal colour schemes + auto, per architecture §6. Pure data and
 * helpers — no React, no next/* — so both the command layer and the CSS
 * feature can consume them.
 *
 * Base palettes are the official scheme colours except where WCAG AA forced a
 * minimal, hue-preserving adjustment (marked ADJUSTED below): the faint muted
 * greys of dracula, tokyo-night, solarized-light and rose-pine-dawn, the
 * latte muted green/yellow, solarized-light fg/green/yellow/cyan and the
 * rose-pine-dawn yellow, plus the light schemes' accent/green/red wherever
 * they render as body-size text (error lines, prompt echo, kv keys). The unit
 * test enforces fg/muted/accent/green/red >= 4.5:1 vs bg and surface (body
 * text) and every colour >= 3:1 (large text/UI), for every scheme.
 */
import type { TermTheme } from "./cookies";

export type SchemeId = Exclude<TermTheme, "auto">;
export type SchemeKind = "dark" | "light";

export interface SchemeColors {
  /** Page/terminal background. */
  bg: string;
  /** Sidebar and card surface. */
  surface: string;
  /** Raised surface (inputs, borders, hover). */
  surface2: string;
  /** Primary text. */
  fg: string;
  /** Faint text (must clear AA vs bg and surface). */
  muted: string;
  accent: string;
  green: string;
  red: string;
  yellow: string;
  cyan: string;
}

export interface TerminalScheme {
  id: SchemeId;
  kind: SchemeKind;
  colors: SchemeColors;
}

export const SCHEMES: readonly TerminalScheme[] = [
  {
    id: "mocha",
    kind: "dark",
    colors: {
      bg: "#1e1e2e",
      surface: "#181825",
      surface2: "#313244",
      fg: "#cdd6f4",
      muted: "#a6adc8",
      accent: "#cba6f7",
      green: "#a6e3a1",
      red: "#f38ba8",
      yellow: "#f9e2af",
      cyan: "#89b4fa",
    },
  },
  {
    id: "dracula",
    kind: "dark",
    colors: {
      bg: "#282a36",
      surface: "#21222c",
      surface2: "#44475a",
      fg: "#f8f8f2",
      // ADJUSTED: #6272a4 lightened (kept hue) for AA vs bg and surface.
      muted: "#8592b8",
      // ADJUSTED: dracula's identity is the pink — #bd93f9 read as mocha's lavender.
      accent: "#ff79c6",
      green: "#50fa7b",
      red: "#ff5555",
      yellow: "#f1fa8c",
      cyan: "#8be9fd",
    },
  },
  {
    id: "tokyo-night",
    kind: "dark",
    colors: {
      bg: "#1a1b26",
      surface: "#16161e",
      surface2: "#292e42",
      fg: "#c0caf5",
      // ADJUSTED: #565f89 lightened (kept hue) for AA vs bg and surface.
      muted: "#7a83ab",
      accent: "#7aa2f7",
      green: "#9ece6a",
      red: "#f7768e",
      yellow: "#e0af68",
      cyan: "#7dcfff",
    },
  },
  {
    id: "latte",
    kind: "light",
    colors: {
      bg: "#eff1f5",
      surface: "#e6e9ef",
      surface2: "#ccd0da",
      fg: "#4c4f69",
      // ADJUSTED: #6c6f85 darkened (kept hue) for AA vs bg and surface.
      muted: "#64667b",
      // ADJUSTED: #8839ef darkened (kept hue) for AA body text vs bg and surface.
      accent: "#8636ef",
      // ADJUSTED: #40a02b darkened for AA body text vs bg and surface.
      green: "#307720",
      // ADJUSTED: #d20f39 darkened for AA body text vs surface.
      red: "#cf0f38",
      // ADJUSTED: #df8e1d darkened for 3:1 vs bg and surface.
      yellow: "#b77418",
      cyan: "#1e66f5",
    },
  },
  {
    id: "solarized-light",
    kind: "light",
    colors: {
      bg: "#fdf6e3",
      surface: "#eee8d5",
      surface2: "#e4ddc8",
      // ADJUSTED: #586e75 darkened for AA vs surface.
      fg: "#556a71",
      // ADJUSTED: #93a1a1 darkened (kept hue) for AA vs bg and surface.
      muted: "#5c6a6a",
      // ADJUSTED: #268bd2 darkened (kept hue) for AA body text vs bg and surface.
      accent: "#1e6ca3",
      // ADJUSTED: #859900 darkened for AA body text vs bg and surface.
      green: "#5f6e00",
      // ADJUSTED: #dc322f darkened for AA body text vs bg and surface.
      red: "#c82422",
      // ADJUSTED: #b58900 darkened for 3:1 vs bg and surface.
      yellow: "#a47c00",
      // ADJUSTED: #2aa198 darkened for 3:1 vs bg and surface.
      cyan: "#269188",
    },
  },
  {
    id: "rose-pine-dawn",
    kind: "light",
    colors: {
      bg: "#faf4ed",
      surface: "#fffaf3",
      surface2: "#f2e9e1",
      fg: "#575279",
      // ADJUSTED: #9893a5 darkened (kept hue) for AA vs bg and surface.
      muted: "#726c81",
      // ADJUSTED: #907aa9 darkened (kept hue) for AA body text vs bg and surface.
      accent: "#7e659b",
      green: "#286983",
      // ADJUSTED: #b4637a darkened for AA body text vs bg and surface.
      red: "#ac536c",
      // ADJUSTED: #ea9d34 darkened for 3:1 vs bg and surface.
      yellow: "#c47a14",
      cyan: "#56949f",
    },
  },
];

export const SCHEME_IDS: readonly SchemeId[] = SCHEMES.map((s) => s.id);

/** What `auto` resolves to: the system dark setting picks the scheme. */
export const AUTO: { dark: SchemeId; light: SchemeId } = { dark: "mocha", light: "latte" };

export function isSchemeId(value: unknown): value is SchemeId {
  return typeof value === "string" && (SCHEME_IDS as readonly string[]).includes(value);
}

export function getScheme(id: SchemeId): TerminalScheme {
  const scheme = SCHEMES.find((s) => s.id === id);
  if (!scheme) throw new Error(`Unknown terminal scheme: ${id}`);
  return scheme;
}

/** Explicit ids ignore the system preference; auto picks mocha or latte. */
export function resolveScheme(theme: TermTheme, prefersDark: boolean): TerminalScheme {
  return getScheme(theme === "auto" ? (prefersDark ? AUTO.dark : AUTO.light) : theme);
}

/**
 * What next-themes must force on <html>: the scheme's kind for explicit
 * schemes, undefined for auto so the system preference decides.
 */
export function forcedThemeOf(theme: TermTheme): SchemeKind | undefined {
  return theme === "auto" ? undefined : getScheme(theme).kind;
}

/** WCAG relative luminance of a #rrggbb colour. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToChannels(hex);
  return (
    0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
  );
}

/** WCAG contrast ratio (1..21) between two #rrggbb colours. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

function channelLuminance(v: number): number {
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function hexToChannels(hex: string): [number, number, number] {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) throw new Error(`Invalid hex colour: ${hex}`);
  const h = match[1] ?? "";
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function hexToHslString(hex: string): string {
  const [r, g, b] = hexToChannels(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  const hueDeg = (((h * 360) % 360) + 360) % 360;
  const hue = String(parseFloat(hueDeg.toFixed(2)));
  const sat = String(parseFloat((s * 100).toFixed(2)));
  const light = String(parseFloat((l * 100).toFixed(2)));
  return `${hue} ${sat}% ${light}%`;
}

/** shadcn HSL variable names the terminal must scope per scheme. */
export const SHADCN_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  "info",
  "info-foreground",
  "border",
  "input",
  "ring",
] as const;

export type ShadcnToken = (typeof SHADCN_TOKENS)[number];
/** HSL triplet strings ("240 21.05% 14.9%") as consumed by hsl(var(--…)). */
export type ShadcnTokenMap = Record<ShadcnToken, string>;

/**
 * Text colour used ON a coloured token (primary/destructive/success chips and
 * buttons): the scheme bg if it clears AA, else white, else black.
 */
function textOn(baseHex: string, scheme: TerminalScheme): string {
  const candidates = [scheme.colors.bg, "#ffffff", "#000000"];
  for (const candidate of candidates) {
    if (contrastRatio(candidate, baseHex) >= 4.5) return candidate;
  }
  return "#000000";
}

/**
 * The shadcn HSL token mapping per scheme: terminal colours flow into the
 * tokens tool clients already use, so panels adopt the active scheme.
 * shadcn `accent`/`secondary` are subtle hover surfaces, so they map to
 * surface2 (never the vivid accent); the accent colour surfaces via
 * primary/ring. shadcn `muted` maps to the sidebar surface so that the
 * AA-adjusted `muted-foreground` text clears 4.5:1 on it by construction.
 */
export function shadcnTokens(id: SchemeId): ShadcnTokenMap {
  const scheme = getScheme(id);
  const c = scheme.colors;
  const fg = hexToHslString(c.fg);
  const surface = hexToHslString(c.surface);
  const surface2 = hexToHslString(c.surface2);
  return {
    background: hexToHslString(c.bg),
    foreground: fg,
    card: surface,
    "card-foreground": fg,
    popover: surface,
    "popover-foreground": fg,
    primary: hexToHslString(c.accent),
    "primary-foreground": hexToHslString(textOn(c.accent, scheme)),
    secondary: surface2,
    "secondary-foreground": hexToHslString(textOn(c.surface2, scheme)),
    muted: surface,
    "muted-foreground": hexToHslString(c.muted),
    accent: surface2,
    "accent-foreground": hexToHslString(textOn(c.surface2, scheme)),
    destructive: hexToHslString(c.red),
    "destructive-foreground": hexToHslString(textOn(c.red, scheme)),
    success: hexToHslString(c.green),
    "success-foreground": hexToHslString(textOn(c.green, scheme)),
    warning: hexToHslString(c.yellow),
    "warning-foreground": hexToHslString(textOn(c.yellow, scheme)),
    info: hexToHslString(c.cyan),
    "info-foreground": hexToHslString(textOn(c.cyan, scheme)),
    border: surface2,
    input: surface2,
    ring: hexToHslString(c.accent),
  };
}
