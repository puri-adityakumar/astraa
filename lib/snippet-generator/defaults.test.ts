import { describe, it, expect } from "vitest";
import {
  BG_PRESETS,
  THEMES,
  FONTS,
  LANGUAGES,
  DEFAULT_STATE,
} from "./defaults";

describe("defaults", () => {
  it("ships exactly 12 background presets", () => {
    expect(BG_PRESETS).toHaveLength(12);
  });

  it("every preset has id, name, and non-empty css", () => {
    for (const p of BG_PRESETS) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.css.length).toBeGreaterThan(0);
    }
  });

  it("preset ids are unique", () => {
    const ids = BG_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ships 9 syntax themes", () => {
    expect(THEMES).toHaveLength(9);
  });

  it("ships 4 fonts", () => {
    expect(FONTS).toHaveLength(4);
  });

  it("ships 20 languages", () => {
    expect(LANGUAGES).toHaveLength(20);
  });

  it("default state references a real preset id", () => {
    if (DEFAULT_STATE.background.kind !== "preset") {
      throw new Error("default background should be a preset");
    }
    const ids = BG_PRESETS.map((p) => p.id);
    expect(ids).toContain(DEFAULT_STATE.background.id);
  });

  it("default theme exists in THEMES", () => {
    const ids = THEMES.map((t) => t.id);
    expect(ids).toContain(DEFAULT_STATE.theme);
  });

  it("default font.family exists in FONTS", () => {
    const families = FONTS.map((f) => f.family);
    expect(families).toContain(DEFAULT_STATE.font.family);
  });

  it("default language exists in LANGUAGES", () => {
    const ids = LANGUAGES.map((l) => l.id);
    expect(ids).toContain(DEFAULT_STATE.language);
  });
});
