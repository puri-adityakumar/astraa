import { describe, expect, it } from "vitest";
import { markdownCommand } from "@/lib/terminal/commands/markdown";
import type { CommandContext } from "@/lib/terminal/types";

const ctx: CommandContext = { theme: "auto", commands: [markdownCommand] };

describe("markdownCommand", () => {
  it("is registered under the markdown slug with the md alias", () => {
    expect(markdownCommand.name).toBe("markdown");
    expect(markdownCommand.aliases).toEqual(["md"]);
    expect(markdownCommand.slug).toBe("markdown");
    expect(markdownCommand.status).toBe("live");
    expect(markdownCommand.category).toBe("Utilities");
  });

  it("opens the panel silently for bare and whitespace args", () => {
    expect(markdownCommand.run("", ctx)).toEqual({
      type: "open",
      slug: "markdown",
    });
    expect(markdownCommand.run("   ", ctx)).toEqual({
      type: "open",
      slug: "markdown",
    });
  });

  it("opens with the opens-in-a-panel line when args are given", () => {
    expect(markdownCommand.run("some notes", ctx)).toEqual({
      type: "open",
      slug: "markdown",
      output: [{ type: "text", text: "Markdown opens in a panel." }],
    });
  });

  it("never answers or falls back (open-only)", () => {
    for (const args of ["", "# Hello", "write notes about **bold**"]) {
      const result = markdownCommand.run(args, ctx);
      if (result instanceof Promise) throw new Error("unexpected async result");
      expect(result.type).toBe("open");
      expect(result.type).not.toBe("fallback");
    }
  });
});
