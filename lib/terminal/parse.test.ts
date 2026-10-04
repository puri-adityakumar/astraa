import { describe, expect, it } from "vitest";
import { parseInput } from "@/lib/terminal/parse";

describe("parseInput", () => {
  it("treats the empty string as empty", () => {
    expect(parseInput("")).toEqual({ kind: "empty" });
  });

  it("treats whitespace-only input as empty", () => {
    expect(parseInput("   ")).toEqual({ kind: "empty" });
    expect(parseInput("\t\n  ")).toEqual({ kind: "empty" });
  });

  it("classifies input without a leading slash as text, trimmed", () => {
    expect(parseInput("hello")).toEqual({ kind: "text", text: "hello" });
    expect(parseInput("  hello world  ")).toEqual({ kind: "text", text: "hello world" });
  });

  it("parses a bare command with no args", () => {
    expect(parseInput("/help")).toEqual({
      kind: "command",
      name: "help",
      args: "",
      raw: "/help",
    });
  });

  it("trims whitespace around the input", () => {
    expect(parseInput("   /clear   ")).toEqual({
      kind: "command",
      name: "clear",
      args: "",
      raw: "/clear",
    });
  });

  it("keeps the command name as typed (case resolved at resolve time)", () => {
    expect(parseInput("/HELP")).toEqual({
      kind: "command",
      name: "HELP",
      args: "",
      raw: "/HELP",
    });
  });

  it("preserves args case and inner spacing, trimming the edges", () => {
    expect(parseInput("/hash   hello  world  ")).toEqual({
      kind: "command",
      name: "hash",
      args: "hello  world",
      raw: "/hash   hello  world",
    });
  });

  it("splits on the first whitespace of any kind", () => {
    expect(parseInput("/hash\tabc def")).toEqual({
      kind: "command",
      name: "hash",
      args: "abc def",
      raw: "/hash\tabc def",
    });
  });

  it("keeps mixed-case args untouched", () => {
    expect(parseInput("/theme Dracula")).toEqual({
      kind: "command",
      name: "theme",
      args: "Dracula",
      raw: "/theme Dracula",
    });
  });

  it("parses a bare slash as an empty command name", () => {
    expect(parseInput("/")).toEqual({
      kind: "command",
      name: "",
      args: "",
      raw: "/",
    });
  });

  it("parses a slash followed by whitespace as an empty command name", () => {
    expect(parseInput("/   help")).toEqual({
      kind: "command",
      name: "",
      args: "help",
      raw: "/   help",
    });
  });
});
