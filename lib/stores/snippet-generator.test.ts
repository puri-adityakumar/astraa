import { describe, it, expect, beforeEach } from "vitest";
import { useSnippetGenerator, stripVolatile } from "./snippet-generator";
import { DEFAULT_STATE } from "@/lib/snippet-generator/defaults";
import { DEFAULT_STATE as DEFAULTS } from "@/lib/snippet-generator/defaults";

describe("useSnippetGenerator", () => {
  beforeEach(() => {
    useSnippetGenerator.getState().reset();
  });

  it("hydrates with defaults", () => {
    const s = useSnippetGenerator.getState();
    expect(s.mode).toBe(DEFAULT_STATE.mode);
    expect(s.code).toBe(DEFAULT_STATE.code);
    expect(s.theme).toBe(DEFAULT_STATE.theme);
    expect(s.background.kind).toBe("preset");
  });

  it("setMode updates mode", () => {
    useSnippetGenerator.getState().setMode("screenshot");
    expect(useSnippetGenerator.getState().mode).toBe("screenshot");
  });

  it("setCode updates code", () => {
    useSnippetGenerator.getState().setCode("hello");
    expect(useSnippetGenerator.getState().code).toBe("hello");
  });

  it("setBackground accepts gradient state", () => {
    useSnippetGenerator
      .getState()
      .setBackground({ kind: "gradient", from: "#000", to: "#fff", angle: 90 });
    const bg = useSnippetGenerator.getState().background;
    expect(bg.kind).toBe("gradient");
  });

  it("setScreenshot stores data url", () => {
    useSnippetGenerator.getState().setScreenshot("data:image/png;base64,xxx");
    expect(useSnippetGenerator.getState().screenshotDataUrl).toContain("data:image/png");
  });

  it("setScreenshot(null) clears", () => {
    useSnippetGenerator.getState().setScreenshot("data:image/png;base64,xxx");
    useSnippetGenerator.getState().setScreenshot(null);
    expect(useSnippetGenerator.getState().screenshotDataUrl).toBeNull();
  });

  it("reset returns to defaults", () => {
    useSnippetGenerator.getState().setCode("changed");
    useSnippetGenerator.getState().reset();
    expect(useSnippetGenerator.getState().code).toBe(DEFAULT_STATE.code);
  });
});

describe("stripVolatile", () => {
  it("nulls screenshotDataUrl", () => {
    const input = { ...DEFAULTS, screenshotDataUrl: "data:image/png;base64,xxx" } as const;
    const out = stripVolatile(input);
    expect(out.screenshotDataUrl).toBeNull();
  });

  it("preserves preset background unchanged", () => {
    const input = { ...DEFAULTS, background: { kind: "preset" as const, id: "ocean" } };
    const out = stripVolatile(input);
    expect(out.background).toEqual({ kind: "preset", id: "ocean" });
  });

  it("demotes image background to default preset", () => {
    const input = {
      ...DEFAULTS,
      background: { kind: "image" as const, dataUrl: "data:image/png;base64,abc", opacity: 0.5 },
    };
    const out = stripVolatile(input);
    expect(out.background).toEqual(DEFAULTS.background);
  });

  it("does not mutate input state", () => {
    const input = {
      ...DEFAULTS,
      background: { kind: "image" as const, dataUrl: "data:x", opacity: 1 },
      screenshotDataUrl: "data:img",
    };
    const snapshot = JSON.parse(JSON.stringify(input));
    stripVolatile(input);
    expect(JSON.parse(JSON.stringify(input))).toEqual(snapshot);
  });
});
