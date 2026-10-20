import { describe, expect, it } from "vitest";
import { snippetCommand } from "@/lib/terminal/commands/snippet";
import type { CommandContext } from "@/lib/terminal/types";

const ctx: CommandContext = { theme: "auto", commands: [snippetCommand] };

describe("snippetCommand", () => {
  it("is registered under the snippet-generator slug with the snippets alias", () => {
    expect(snippetCommand.name).toBe("snippet");
    expect(snippetCommand.aliases).toEqual(["snippets"]);
    expect(snippetCommand.slug).toBe("snippet-generator");
    expect(snippetCommand.status).toBe("live");
    expect(snippetCommand.category).toBe("Developer Tools");
  });

  it("opens the panel silently for bare and whitespace args", () => {
    expect(snippetCommand.run("", ctx)).toEqual({
      type: "open",
      slug: "snippet-generator",
    });
    expect(snippetCommand.run("   ", ctx)).toEqual({
      type: "open",
      slug: "snippet-generator",
    });
  });

  it("opens with the opens-in-a-panel line when args are given", () => {
    expect(snippetCommand.run("my snippets", ctx)).toEqual({
      type: "open",
      slug: "snippet-generator",
      output: [{ type: "text", text: "Snippet Generator opens in a panel." }],
    });
  });

  it("never answers or falls back (open-only)", () => {
    for (const args of ["", "const x = 1", "typescript dark theme"]) {
      const result = snippetCommand.run(args, ctx);
      if (result instanceof Promise) throw new Error("unexpected async result");
      expect(result.type).toBe("open");
      expect(result.type).not.toBe("fallback");
    }
  });
});
