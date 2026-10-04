import { describe, expect, it } from "vitest";
import { autoThemeCss, TERM_CSS_VARS } from "./theme-css";
import { getScheme } from "./themes";

describe("autoThemeCss", () => {
  const css = autoThemeCss();

  it("scopes the default (mocha) variables to the terminal root", () => {
    const base = css.slice(0, css.indexOf("@media"));
    expect(base).toContain('[data-flavour="terminal"]');
    expect(base).toContain(`--term-bg: ${getScheme("mocha").colors.bg}`);
    expect(base).toContain(`--term-fg: ${getScheme("mocha").colors.fg}`);
    expect(base).not.toContain(getScheme("latte").colors.bg);
  });

  it("switches to latte inside the light system-preference media query", () => {
    const media = css.slice(css.indexOf("@media"));
    expect(media).toContain("(prefers-color-scheme: light)");
    expect(media).toContain(`--term-bg: ${getScheme("latte").colors.bg}`);
    expect(media).not.toContain(`--term-bg: ${getScheme("mocha").colors.bg}`);
  });

  it("emits every terminal colour variable exactly once per block", () => {
    for (const variable of Object.values(TERM_CSS_VARS)) {
      // Colon-terminated so "--term-surface" does not count "--term-surface2".
      const occurrences = css.split(`${variable}:`).length - 1;
      expect(occurrences, variable).toBe(2);
    }
  });
});
