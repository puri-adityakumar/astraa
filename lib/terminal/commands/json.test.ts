import { describe, expect, it } from "vitest";
import { findFirstSyntaxError, jsonCommand } from "./json";
import type { CommandContext, CommandResult } from "../types";

const ctx: CommandContext = { theme: "auto", commands: [jsonCommand] };

function answerParts(result: CommandResult): { text: string; code: string } {
  if (result.type !== "answer") {
    throw new Error(`Expected an answer, got ${result.type}`);
  }
  const text = result.output.find((b) => b.type === "text");
  const code = result.output.find((b) => b.type === "code");
  if (!text || text.type !== "text" || !code || code.type !== "code") {
    throw new Error("Expected a text block and a code block");
  }
  return { text: text.text, code: code.code };
}

describe("json command", () => {
  it("opens the panel when called without args", async () => {
    expect(await jsonCommand.run("", ctx)).toEqual({
      type: "open",
      slug: "json",
    });
  });

  it("opens the panel for whitespace-only args", async () => {
    expect(await jsonCommand.run("   ", ctx)).toEqual({
      type: "open",
      slug: "json",
    });
  });

  it("pretty-prints an object with a 2-space indent", async () => {
    const { text, code } = answerParts(await jsonCommand.run('{"a":1}', ctx));
    expect(text).toBe("Valid JSON");
    expect(code).toBe('{\n  "a": 1\n}');
  });

  it("keeps key order and shows every key", async () => {
    const { code } = answerParts(
      await jsonCommand.run('{"b":1,"a":2}', ctx),
    );
    expect(code).toBe('{\n  "b": 1,\n  "a": 2\n}');
  });

  it("pretty-prints nested arrays across lines", async () => {
    const { code } = answerParts(
      await jsonCommand.run('{"list":[1,2,3],"ok":true}', ctx),
    );
    expect(code).toBe(
      '{\n  "list": [\n    1,\n    2,\n    3\n  ],\n  "ok": true\n}',
    );
  });

  it("accepts the bare number literal 42", async () => {
    const { text, code } = answerParts(await jsonCommand.run("42", ctx));
    expect(text).toBe("Valid JSON");
    expect(code).toBe("42");
  });

  it("accepts string, boolean and null literals", async () => {
    expect(answerParts(await jsonCommand.run('"x"', ctx)).code).toBe('"x"');
    expect(answerParts(await jsonCommand.run("true", ctx)).code).toBe("true");
    expect(answerParts(await jsonCommand.run("null", ctx)).code).toBe("null");
  });

  it("trims surrounding whitespace around the JSON", async () => {
    const { code } = answerParts(await jsonCommand.run("  [1]  ", ctx));
    expect(code).toBe("[\n  1\n]");
  });

  it("falls back with the parse position on invalid JSON", async () => {
    expect(await jsonCommand.run('{"a":}', ctx)).toEqual({
      type: "fallback",
      slug: "json",
      message:
        'I don\'t understand "{"a":}". Invalid JSON at position 5. Opening JSON…',
    });
  });

  it("falls back with a position for unterminated structures", async () => {
    const result = await jsonCommand.run("[1,", ctx);
    if (result.type !== "fallback") throw new Error("expected fallback");
    expect(result.message).toContain("position 3");
    expect(result.message).toContain("Opening JSON…");
  });

  it("falls back with a position for trailing garbage", async () => {
    const result = await jsonCommand.run("{} x", ctx);
    if (result.type !== "fallback") throw new Error("expected fallback");
    expect(result.message).toContain("position 3");
  });

  it("is registered under the Developer Tools category", () => {
    expect(jsonCommand.name).toBe("json");
    expect(jsonCommand.aliases).toEqual([]);
    expect(jsonCommand.slug).toBe("json");
    expect(jsonCommand.status).toBe("live");
    expect(jsonCommand.category).toBe("Developer Tools");
  });
});

describe("findFirstSyntaxError", () => {
  it("returns null for valid JSON", () => {
    expect(findFirstSyntaxError('{"a": [1, 2.5, true, null, "s"]}')).toBeNull();
    expect(findFirstSyntaxError('  { "ké y": "\\u00e9" }  ')).toBeNull();
  });

  it("locates an unexpected token", () => {
    expect(findFirstSyntaxError('{"a":}')).toBe(5);
  });

  it("locates a missing value at end of input", () => {
    expect(findFirstSyntaxError("[1,")).toBe(3);
    expect(findFirstSyntaxError('{"a"')).toBe(4);
  });

  it("locates trailing garbage", () => {
    expect(findFirstSyntaxError("{} x")).toBe(3);
    expect(findFirstSyntaxError("42 nope")).toBe(3);
  });

  it("locates an unterminated string", () => {
    expect(findFirstSyntaxError('{"a": "b')).toBe(8);
  });

  it("locates a bad escape sequence", () => {
    expect(findFirstSyntaxError('"\\q"')).toBe(1);
    expect(findFirstSyntaxError('"\\u12"')).toBe(1);
  });

  it("locates a raw control character in a string", () => {
    expect(findFirstSyntaxError('"a\u0000b"')).toBe(2);
  });

  it("locates a property name that is not a string", () => {
    expect(findFirstSyntaxError("{a:1}")).toBe(1);
  });

  it("locates a malformed number", () => {
    expect(findFirstSyntaxError("[1.2.3]")).toBe(4);
    expect(findFirstSyntaxError("[-]")).toBe(1);
  });

  it("locates empty input", () => {
    expect(findFirstSyntaxError("")).toBe(0);
    expect(findFirstSyntaxError("   ")).toBe(3);
  });

  it("locates a trailing comma in objects and arrays", () => {
    expect(findFirstSyntaxError('{"a":1,}')).toBe(7);
    expect(findFirstSyntaxError("[1,2,]")).toBe(5);
  });
});
