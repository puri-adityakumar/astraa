import { describe, expect, it, vi } from "vitest";
import { parseRegexArgs, regexCommand } from "./regex";
import { runMatchesSafe } from "@/lib/regex-tester/redos-client";
import type { CommandContext, CommandResult, OutputBlock } from "../types";

vi.mock("@/lib/regex-tester/redos-client", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/regex-tester/redos-client")>();
  return { ...actual, runMatchesSafe: vi.fn(actual.runMatchesSafe) };
});

const runMatchesSafeMock = vi.mocked(runMatchesSafe);

const ctx: CommandContext = { theme: "auto", commands: [regexCommand] };

function outputText(result: CommandResult): string {
  if (result.type !== "answer") {
    throw new Error(`Expected an answer, got ${result.type}`);
  }
  return result.output.map(blockToString).join("\n");
}

function blockToString(block: OutputBlock): string {
  switch (block.type) {
    case "text":
    case "error":
      return block.text;
    case "code":
      return block.code;
    case "list":
      return block.items.join("\n");
    case "kv":
      return block.entries.map((e) => `${e.key} ${e.value}`).join("\n");
    case "secret":
      return "secret";
  }
}

function expectedFallback(args: string): CommandResult {
  return {
    type: "fallback",
    slug: "regex",
    message: `I don't understand "${args}". Opening Regex…`,
  };
}

describe("regex command", () => {
  it("opens the panel when called without args", async () => {
    expect(await regexCommand.run("", ctx)).toEqual({
      type: "open",
      slug: "regex",
    });
  });

  it("opens the panel for whitespace-only args", async () => {
    expect(await regexCommand.run("   ", ctx)).toEqual({
      type: "open",
      slug: "regex",
    });
  });

  it("lists the match count with each value and index", async () => {
    const text = outputText(await regexCommand.run("/\\d+/g a1b22c333", ctx));
    expect(text).toContain("3 matches");
    expect(text).toContain('"1" at index 1');
    expect(text).toContain('"22" at index 3');
    expect(text).toContain('"333" at index 6');
  });

  it("uses the singular form for exactly one match", async () => {
    const text = outputText(await regexCommand.run("/\\d+/ x2", ctx));
    expect(text).toContain("1 match\n");
    expect(text).toContain('"2" at index 1');
  });

  it("answers No matches. when nothing matches", async () => {
    expect(outputText(await regexCommand.run("/\\d+/g abc", ctx))).toBe(
      "No matches.",
    );
  });

  it("matches without flags", async () => {
    const text = outputText(await regexCommand.run("/b/ abc", ctx));
    expect(text).toContain('"b" at index 1');
  });

  it("keeps escaped delimiters inside the pattern", async () => {
    const text = outputText(await regexCommand.run("/a\\/b/g a/b", ctx));
    expect(text).toContain('"a/b" at index 0');
  });

  it("falls back on an invalid pattern", async () => {
    expect(await regexCommand.run("/(/ x", ctx)).toEqual(
      expectedFallback("/(/ x"),
    );
  });

  it("falls back when the test text is missing", async () => {
    expect(await regexCommand.run("/\\d+/g", ctx)).toEqual(
      expectedFallback("/\\d+/g"),
    );
  });

  it("falls back when the test text is whitespace only", async () => {
    expect(await regexCommand.run("/\\d+/g    ", ctx)).toEqual(
      expectedFallback("/\\d+/g"),
    );
  });

  it("falls back without a closing delimiter", async () => {
    expect(await regexCommand.run("/abc x", ctx)).toEqual(
      expectedFallback("/abc x"),
    );
  });

  it("falls back on invalid flags", async () => {
    expect(await regexCommand.run("/abc/q x", ctx)).toEqual(
      expectedFallback("/abc/q x"),
    );
  });

  it("runs matches through the ReDoS-safe worker route", async () => {
    await regexCommand.run("/\\d+/g a1b22c333", ctx);
    expect(runMatchesSafeMock).toHaveBeenCalledWith("\\d+", "g", "a1b22c333");
  });

  it("falls back when the worker times out on a catastrophic pattern", async () => {
    runMatchesSafeMock.mockImplementationOnce(async () => ({
      results: [],
      elapsedMs: 1500,
      timedOut: true,
      hardTimeout: true,
      capped: false,
    }));
    const result = await regexCommand.run("/(a+)+$/g aaaaaa", ctx);
    expect(result).toEqual(expectedFallback("/(a+)+$/g aaaaaa"));
  });

  it("caps how many matches are listed", async () => {
    const text = outputText(await regexCommand.run("/a/g " + "a".repeat(60), ctx));
    expect(text).toContain("60 matches");
    expect(text).toContain("… 10 more not shown.");
  });

  it("is registered under its /re alias", () => {
    expect(regexCommand.name).toBe("regex");
    expect(regexCommand.aliases).toEqual(["re"]);
    expect(regexCommand.slug).toBe("regex");
    expect(regexCommand.status).toBe("live");
    expect(regexCommand.category).toBe("Developer Tools");
  });
});

describe("parseRegexArgs", () => {
  it("splits pattern, flags and text", () => {
    expect(parseRegexArgs("/\\d+/g a1b22c333")).toEqual({
      pattern: "\\d+",
      flags: "g",
      text: "a1b22c333",
    });
  });

  it("keeps empty flags when none are given", () => {
    expect(parseRegexArgs("/abc/ x")).toEqual({
      pattern: "abc",
      flags: "",
      text: "x",
    });
  });

  it("returns no text when the flags end the input", () => {
    expect(parseRegexArgs("/\\d+/g")).toEqual({
      pattern: "\\d+",
      flags: "g",
      text: "",
    });
  });

  it("treats an escaped slash as part of the pattern", () => {
    expect(parseRegexArgs("/a\\/b/g x")).toEqual({
      pattern: "a\\/b",
      flags: "g",
      text: "x",
    });
  });

  it("keeps the text verbatim after the first separator", () => {
    expect(parseRegexArgs("/a/g  b  c")).toEqual({
      pattern: "a",
      flags: "g",
      text: " b  c",
    });
  });

  it("returns null without a closing delimiter", () => {
    expect(parseRegexArgs("/abc x")).toBeNull();
    expect(parseRegexArgs("/abc\\")).toBeNull();
  });

  it("returns null for input without a leading delimiter", () => {
    expect(parseRegexArgs("abc")).toBeNull();
    expect(parseRegexArgs("/")).toBeNull();
  });
});
