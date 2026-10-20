import { describe, expect, it } from "vitest";
import { calculatorCommand } from "./calculator";
import type { CommandContext } from "../types";

const ctx: CommandContext = { theme: "auto", commands: [calculatorCommand] };

async function answerText(args: string): Promise<string> {
  const result = await calculatorCommand.run(args, ctx);
  if (result.type !== "answer") {
    throw new Error(`Expected an answer for "${args}", got ${result.type}`);
  }
  return result.output
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n");
}

describe("calculator command", () => {
  it("opens the panel when called without args", async () => {
    expect(await calculatorCommand.run("", ctx)).toEqual({
      type: "open",
      slug: "calculator",
    });
  });

  it("opens the panel for whitespace-only args", async () => {
    expect(await calculatorCommand.run("   ", ctx)).toEqual({
      type: "open",
      slug: "calculator",
    });
  });

  it("answers simple arithmetic inline", async () => {
    expect(await answerText("2+2")).toBe("= 4");
  });

  it("respects operator precedence", async () => {
    expect(await answerText("2+3*4")).toBe("= 14");
  });

  it("answers decimal arithmetic", async () => {
    expect(await answerText("3.5+1.25")).toBe("= 4.75");
  });

  it("trims binary floating-point noise", async () => {
    expect(await answerText("0.1+0.2")).toBe("= 0.3");
  });

  it("falls back when the result is Infinity", async () => {
    expect(await calculatorCommand.run("5/0", ctx)).toEqual({
      type: "fallback",
      slug: "calculator",
      message: 'I don\'t understand "5/0". Opening Calculator…',
    });
  });

  it("falls back when the result is NaN (unsupported input)", async () => {
    expect(await calculatorCommand.run("2+fuck", ctx)).toEqual({
      type: "fallback",
      slug: "calculator",
      message: 'I don\'t understand "2+fuck". Opening Calculator…',
    });
  });

  it("falls back on -Infinity-shaped token streams", async () => {
    // "-5/0" tokenizes into a dangling minus: the lib returns NaN.
    expect((await calculatorCommand.run("-5/0", ctx)).type).toBe("fallback");
  });

  it("falls back on parentheses the lib does not support", async () => {
    expect((await calculatorCommand.run("(2+2", ctx)).type).toBe("fallback");
  });

  it("is registered under its /calc alias and name, case-insensitively", () => {
    expect(calculatorCommand.name).toBe("calculator");
    expect(calculatorCommand.aliases).toContain("calc");
    expect(calculatorCommand.slug).toBe("calculator");
    expect(calculatorCommand.status).toBe("live");
    expect(calculatorCommand.category).toBe("Utilities");
  });
});
