import { describe, expect, it } from "vitest";
import {
  AUTO,
  SCHEMES,
  SCHEME_IDS,
  contrastRatio,
  forcedThemeOf,
  getScheme,
  isSchemeId,
  relativeLuminance,
  resolveScheme,
  shadcnTokens,
} from "@/lib/terminal/themes";
import type { ShadcnToken, TerminalScheme } from "@/lib/terminal/themes";

const BASE_BG: Record<string, string> = {
  mocha: "#1e1e2e",
  dracula: "#282a36",
  "tokyo-night": "#1a1b26",
  latte: "#eff1f5",
  "solarized-light": "#fdf6e3",
  "rose-pine-dawn": "#faf4ed",
};

const BASE_SURFACE: Record<string, string> = {
  mocha: "#181825",
  dracula: "#21222c",
  "tokyo-night": "#16161e",
  latte: "#e6e9ef",
  "solarized-light": "#eee8d5",
  "rose-pine-dawn": "#fffaf3",
};

const BASE_SURFACE2: Record<string, string> = {
  mocha: "#313244",
  dracula: "#44475a",
  "tokyo-night": "#292e42",
  latte: "#ccd0da",
  "solarized-light": "#e4ddc8",
  "rose-pine-dawn": "#f2e9e1",
};

const UNADJUSTED: Record<string, string[]> = {
  mocha: ["fg", "muted", "accent", "green", "red", "yellow", "cyan"],
  dracula: ["fg", "accent", "green", "red", "yellow", "cyan"],
  "tokyo-night": ["fg", "accent", "green", "red", "yellow", "cyan"],
  latte: ["fg", "accent", "red", "cyan"],
  "solarized-light": ["accent", "red"],
  "rose-pine-dawn": ["fg", "accent", "green", "red", "cyan"],
};

const BASE_TEXT: Record<string, Record<string, string>> = {
  mocha: { fg: "#cdd6f4", muted: "#a6adc8", accent: "#cba6f7", green: "#a6e3a1", red: "#f38ba8", yellow: "#f9e2af", cyan: "#89b4fa" },
  dracula: { fg: "#f8f8f2", muted: "#6272a4", accent: "#bd93f9", green: "#50fa7b", red: "#ff5555", yellow: "#f1fa8c", cyan: "#8be9fd" },
  "tokyo-night": { fg: "#c0caf5", muted: "#565f89", accent: "#7aa2f7", green: "#9ece6a", red: "#f7768e", yellow: "#e0af68", cyan: "#7dcfff" },
  latte: { fg: "#4c4f69", muted: "#6c6f85", accent: "#8839ef", green: "#40a02b", red: "#d20f39", yellow: "#df8e1d", cyan: "#1e66f5" },
  "solarized-light": { fg: "#586e75", muted: "#93a1a1", accent: "#268bd2", green: "#859900", red: "#dc322f", yellow: "#b58900", cyan: "#2aa198" },
  "rose-pine-dawn": { fg: "#575279", muted: "#9893a5", accent: "#907aa9", green: "#286983", red: "#b4637a", yellow: "#ea9d34", cyan: "#56949f" },
};

function colors(scheme: TerminalScheme): Record<string, string> {
  return scheme.colors as unknown as Record<string, string>;
}

describe("scheme table", () => {
  it("exports the six schemes in architecture order with the right kind", () => {
    expect(SCHEME_IDS).toEqual([
      "mocha",
      "dracula",
      "tokyo-night",
      "latte",
      "solarized-light",
      "rose-pine-dawn",
    ]);
    expect(SCHEMES.map((s) => s.kind)).toEqual([
      "dark",
      "dark",
      "dark",
      "light",
      "light",
      "light",
    ]);
  });

  it("keeps the base bg/surface/surface2 hex values exactly per architecture", () => {
    for (const scheme of SCHEMES) {
      expect(scheme.colors.bg).toBe(BASE_BG[scheme.id]);
      expect(scheme.colors.surface).toBe(BASE_SURFACE[scheme.id]);
      expect(scheme.colors.surface2).toBe(BASE_SURFACE2[scheme.id]);
    }
  });

  it("leaves mocha and the passing base text colours untouched", () => {
    for (const scheme of SCHEMES) {
      const c = colors(scheme);
      const unchanged = UNADJUSTED[scheme.id] ?? [];
      for (const role of unchanged) {
        expect(c[role]).toBe(BASE_TEXT[scheme.id]?.[role]);
      }
    }
  });

  it("adjusts only the colours that need it, keeping their hue", () => {
    const adjusted: Record<string, string[]> = {
      dracula: ["muted"],
      "tokyo-night": ["muted"],
      latte: ["muted", "green", "yellow"],
      "solarized-light": ["fg", "muted", "green", "yellow", "cyan"],
      "rose-pine-dawn": ["muted", "yellow"],
    };
    for (const scheme of SCHEMES) {
      const c = colors(scheme);
      const adjustedRoles = adjusted[scheme.id] ?? [];
      for (const role of ["fg", "muted", "accent", "green", "red", "yellow", "cyan"]) {
        const shouldAdjust = adjustedRoles.includes(role);
        expect(c[role] !== BASE_TEXT[scheme.id]?.[role]).toBe(shouldAdjust);
      }
    }
  });
});

describe("WCAG contrast (VAL-THEME-009)", () => {
  it("gives fg and muted at least 4.5:1 vs bg and surface in every scheme", () => {
    for (const scheme of SCHEMES) {
      for (const role of ["fg", "muted"] as const) {
        const hex = scheme.colors[role];
        expect(contrastRatio(hex, scheme.colors.bg)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(hex, scheme.colors.surface)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("gives accent and status colours at least 3:1 vs bg and surface in every scheme", () => {
    for (const scheme of SCHEMES) {
      for (const role of ["accent", "green", "red", "yellow", "cyan"] as const) {
        const hex = scheme.colors[role];
        expect(contrastRatio(hex, scheme.colors.bg)).toBeGreaterThanOrEqual(3);
        expect(contrastRatio(hex, scheme.colors.surface)).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

describe("contrast helpers", () => {
  it("computes known ratios", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 1);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    expect(contrastRatio("#000000", "#ffffff")).toBe(contrastRatio("#ffffff", "#000000"));
  });

  it("computes known luminances", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
  });
});

describe("auto scheme resolution", () => {
  it("documents the mocha/latte split", () => {
    expect(AUTO).toEqual({ dark: "mocha", light: "latte" });
  });

  it("resolves auto by the system preference and passes explicit ids through", () => {
    expect(resolveScheme("auto", true).id).toBe("mocha");
    expect(resolveScheme("auto", false).id).toBe("latte");
    expect(resolveScheme("dracula", true).id).toBe("dracula");
    expect(resolveScheme("rose-pine-dawn", false).kind).toBe("light");
  });

  it("guards scheme ids and getScheme", () => {
    expect(isSchemeId("mocha")).toBe(true);
    expect(isSchemeId("auto")).toBe(false);
    expect(isSchemeId("nope")).toBe(false);
    expect(getScheme("dracula").id).toBe("dracula");
  });
});

describe("shadcn token mapping", () => {
  const REQUIRED = [
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
    "border",
    "input",
    "ring",
  ] as const;

  it("maps every required token for every scheme in HSL triplet form", () => {
    for (const scheme of SCHEMES) {
      const tokens = shadcnTokens(scheme.id);
      for (const token of REQUIRED) {
        expect(tokens[token], `${scheme.id}.${token}`).toMatch(
          /^-?\d+(\.\d+)? -?[\d.]+% -?[\d.]+%$/,
        );
      }
    }
    expect(shadcnTokens("mocha").background).toBe("240 21.05% 14.9%");
    expect(shadcnTokens("mocha").foreground).toBe("226.15 63.93% 88.04%");
    expect(shadcnTokens("latte").background).toBe("220 23.08% 94.9%");
  });

  it("keeps every *-foreground token at AA contrast with its surface token", () => {
    const parseHsl = (value: string): string => {
      const parts = value.split(" ").map((part) => parseFloat(part));
      const h = parts[0] ?? 0;
      const s = parts[1] ?? 0;
      const l = parts[2] ?? 0;
      const hNorm = (((h % 360) + 360) % 360) / 60;
      const sFrac = s / 100;
      const lFrac = l / 100;
      const c = (1 - Math.abs(2 * lFrac - 1)) * sFrac;
      const x = c * (1 - Math.abs((hNorm % 2) - 1));
      let r1 = 0;
      let g1 = 0;
      let b1 = 0;
      if (hNorm < 1) {
        r1 = c;
        g1 = x;
      } else if (hNorm < 2) {
        r1 = x;
        g1 = c;
      } else if (hNorm < 3) {
        g1 = c;
        b1 = x;
      } else if (hNorm < 4) {
        g1 = x;
        b1 = c;
      } else if (hNorm < 5) {
        r1 = x;
        b1 = c;
      } else {
        r1 = c;
        b1 = x;
      }
      const m = lFrac - c / 2;
      const to255 = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
      return `#${to255(r1)}${to255(g1)}${to255(b1)}`;
    };
    for (const scheme of SCHEMES) {
      const tokens = shadcnTokens(scheme.id);
      const pairs: [ShadcnToken, ShadcnToken][] = [
        ["foreground", "background"],
        ["card-foreground", "card"],
        ["popover-foreground", "popover"],
        ["primary-foreground", "primary"],
        ["secondary-foreground", "secondary"],
        ["muted-foreground", "muted"],
        ["accent-foreground", "accent"],
        ["destructive-foreground", "destructive"],
      ];
      for (const [fgToken, bgToken] of pairs) {
        const ratio = contrastRatio(parseHsl(tokens[fgToken]), parseHsl(tokens[bgToken]));
        expect(ratio, `${scheme.id} ${fgToken} vs ${bgToken}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

describe("forcedThemeOf", () => {
  it("forces the scheme kind for every explicit scheme", () => {
    expect(forcedThemeOf("mocha")).toBe("dark");
    expect(forcedThemeOf("dracula")).toBe("dark");
    expect(forcedThemeOf("tokyo-night")).toBe("dark");
    expect(forcedThemeOf("latte")).toBe("light");
    expect(forcedThemeOf("solarized-light")).toBe("light");
    expect(forcedThemeOf("rose-pine-dawn")).toBe("light");
  });

  it("leaves auto unforced so the system preference decides", () => {
    expect(forcedThemeOf("auto")).toBeUndefined();
  });
});
