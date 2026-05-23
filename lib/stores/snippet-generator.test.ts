import { describe, it, expect, beforeEach } from "vitest";
import { useSnippetGenerator } from "./snippet-generator";
import { DEFAULT_STATE } from "@/lib/snippet-generator/defaults";

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
