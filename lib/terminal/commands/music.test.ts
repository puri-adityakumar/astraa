import { describe, expect, it } from "vitest";
import { musicCommand } from "@/lib/terminal/commands/music";
import type { CommandContext } from "@/lib/terminal/types";

const ctx: CommandContext = { theme: "auto", commands: [musicCommand] };

describe("musicCommand", () => {
  it("is registered under the music slug as coming soon", () => {
    expect(musicCommand.name).toBe("music");
    expect(musicCommand.aliases).toEqual([]);
    expect(musicCommand.slug).toBe("music");
    expect(musicCommand.status).toBe("coming-soon");
    expect(musicCommand.category).toBe("Utilities");
  });

  it("answers the coming-soon line for bare args", () => {
    expect(musicCommand.run("", ctx)).toEqual({
      type: "answer",
      output: [{ type: "text", text: "Music is coming soon." }],
    });
  });

  it("answers the same coming-soon line and ignores args", () => {
    expect(musicCommand.run("now please", ctx)).toEqual({
      type: "answer",
      output: [{ type: "text", text: "Music is coming soon." }],
    });
    expect(musicCommand.run("lofi beats 24/7", ctx)).toEqual({
      type: "answer",
      output: [{ type: "text", text: "Music is coming soon." }],
    });
  });

  it("never opens a panel or falls back", () => {
    for (const args of ["", "now please", "   "]) {
      const result = musicCommand.run(args, ctx);
      if (result instanceof Promise) throw new Error("unexpected async result");
      expect(result.type).toBe("answer");
    }
  });
});
