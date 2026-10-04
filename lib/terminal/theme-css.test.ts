import { describe, expect, it } from "vitest";
import type { TermTheme } from "./cookies";
import { schemeCss, TERM_CSS_VARS } from "./theme-css";
import { getScheme, SCHEME_IDS, shadcnTokens } from "./themes";

/** The base (outside any media query) declaration block for a theme id. */
function blockFor(css: string, id: TermTheme): string {
  const match = new RegExp(`\\[data-term-theme="${id}"\\]\\{([^}]*)\\}`).exec(
    css,
  );
  const block = match?.[1];
  if (!block) throw new Error(`No base CSS block for ${id}`);
  return block;
}

/** The declaration block for a theme id inside the light media query. */
function mediaBlockFor(css: string, id: TermTheme): string {
  const media = css.slice(css.indexOf("@media"));
  const match = new RegExp(`\\[data-term-theme="${id}"\\]\\{([^}]*)\\}`).exec(
    media,
  );
  const block = match?.[1];
  if (!block) throw new Error(`No media CSS block for ${id}`);
  return block;
}

describe("schemeCss", () => {
  const css = schemeCss();

  it("scopes every explicit scheme under its data-term-theme attribute", () => {
    for (const id of SCHEME_IDS) {
      expect(css).toContain(`[data-term-theme="${id}"]`);
    }
  });

  it("declares every terminal colour variable from the scheme colours", () => {
    for (const id of SCHEME_IDS) {
      const block = blockFor(css, id);
      for (const key of Object.keys(TERM_CSS_VARS) as Array<
        keyof typeof TERM_CSS_VARS
      >) {
        expect(block, `${id} ${TERM_CSS_VARS[key]}`).toContain(
          `${TERM_CSS_VARS[key]}: ${getScheme(id).colors[key]}`,
        );
      }
    }
  });

  it("maps the shadcn HSL tokens for every explicit scheme", () => {
    for (const id of SCHEME_IDS) {
      const block = blockFor(css, id);
      const tokens = shadcnTokens(id);
      expect(block, `${id} --background`).toContain(
        `--background: ${tokens.background}`,
      );
      expect(block, `${id} --foreground`).toContain(
        `--foreground: ${tokens.foreground}`,
      );
      expect(block, `${id} --card`).toContain(`--card: ${tokens.card}`);
      expect(block, `${id} --muted-foreground`).toContain(
        `--muted-foreground: ${tokens["muted-foreground"]}`,
      );
      expect(block, `${id} --primary`).toContain(
        `--primary: ${tokens.primary}`,
      );
      expect(block, `${id} --ring`).toContain(`--ring: ${tokens.ring}`);
    }
  });

  it("resolves auto to mocha by default and latte under the light media query", () => {
    const base = blockFor(css, "auto");
    expect(base).toContain(`--term-bg: ${getScheme("mocha").colors.bg}`);
    expect(base).toContain(`--term-fg: ${getScheme("mocha").colors.fg}`);
    expect(base).not.toContain(getScheme("latte").colors.bg);

    expect(css).toContain("@media (prefers-color-scheme: light)");
    const media = mediaBlockFor(css, "auto");
    expect(media).toContain(`--term-bg: ${getScheme("latte").colors.bg}`);
    expect(media).toContain(`--term-fg: ${getScheme("latte").colors.fg}`);
    expect(media).not.toContain(getScheme("mocha").colors.bg);
  });

  it("keeps explicit scheme blocks outside media queries for instant switching", () => {
    const base = css.slice(0, css.indexOf("@media"));
    for (const id of SCHEME_IDS) {
      expect(base, id).toContain(`[data-term-theme="${id}"]`);
    }
  });

  it("emits each variable once per explicit scheme plus twice for auto", () => {
    for (const variable of Object.values(TERM_CSS_VARS)) {
      // Colon-terminated so "--term-surface" does not count "--term-surface2".
      const occurrences = css.split(`${variable}:`).length - 1;
      expect(occurrences, variable).toBe(2 * (SCHEME_IDS.length + 2));
    }
  });

  it("also scopes every scheme at :root via :has for portalled overlays", () => {
    for (const id of SCHEME_IDS) {
      expect(css).toContain(
        `:root:has([data-flavour="terminal"][data-term-theme="${id}"])`,
      );
    }
    const media = css.slice(css.indexOf("@media"));
    expect(media).toContain(
      ':root:has([data-flavour="terminal"][data-term-theme="auto"])',
    );
  });

  it("keeps the :root:has blocks outside media queries for explicit schemes", () => {
    const base = css.slice(0, css.indexOf("@media"));
    for (const id of SCHEME_IDS) {
      expect(base, id).toContain(
        `:root:has([data-flavour="terminal"][data-term-theme="${id}"])`,
      );
    }
  });
});
