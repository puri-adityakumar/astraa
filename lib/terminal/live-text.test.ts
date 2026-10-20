import { describe, expect, it } from "vitest";
import { outputToLiveText, SECRET_LIVE_TEXT } from "./live-text";
import { runInput } from "./registry";
import type { OutputBlock } from "./types";

describe("outputToLiveText", () => {
  it("returns the text of a text block", () => {
    const blocks: OutputBlock[] = [{ type: "text", text: "Theme set to mocha." }];
    expect(outputToLiveText(blocks)).toBe("Theme set to mocha.");
  });

  it("returns the text of an error block", () => {
    const blocks: OutputBlock[] = [{ type: "error", text: 'Unknown command "/x".' }];
    expect(outputToLiveText(blocks)).toBe('Unknown command "/x".');
  });

  it("joins kv entries as key: value lines", () => {
    const blocks: OutputBlock[] = [
      {
        type: "kv",
        entries: [
          { key: "mocha", value: "dark" },
          { key: "latte", value: "light" },
        ],
      },
    ];
    expect(outputToLiveText(blocks)).toBe("mocha: dark\nlatte: light");
  });

  it("returns the code of a code block", () => {
    const blocks: OutputBlock[] = [{ type: "code", code: "= 4" }];
    expect(outputToLiveText(blocks)).toBe("= 4");
  });

  it("joins list items with newlines", () => {
    const blocks: OutputBlock[] = [{ type: "list", items: ["one", "two"] }];
    expect(outputToLiveText(blocks)).toBe("one\ntwo");
  });

  it("joins multiple blocks with newlines", () => {
    const blocks: OutputBlock[] = [
      { type: "text", text: "Utilities" },
      { type: "kv", entries: [{ key: "/calculator", value: "Evaluate arithmetic · live" }] },
    ];
    expect(outputToLiveText(blocks)).toBe("Utilities\n/calculator: Evaluate arithmetic · live");
  });

  it("announces secrets as hidden without revealing them", () => {
    const blocks: OutputBlock[] = [
      { type: "secret", secret: "hunter2" },
      { type: "text", text: "Use /password <8-128> or open the generator" },
    ];
    expect(outputToLiveText(blocks)).toBe(SECRET_LIVE_TEXT);
    expect(outputToLiveText(blocks)).not.toContain("hunter2");
    expect(SECRET_LIVE_TEXT).toBe("Password generated, hidden");
  });

  it("returns an empty string for no blocks", () => {
    expect(outputToLiveText([])).toBe("");
  });

  it("announces opening settings without requiring a new output block type", async () => {
    const result = await runInput("/config", "auto");
    expect(result?.type).toBe("builtin");
    if (result?.type !== "builtin") return;
    expect(outputToLiveText(result.output ?? [])).toBe("Opening settings.");
  });
});
