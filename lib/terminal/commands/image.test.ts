import { describe, expect, it } from "vitest";
import { imageCommand } from "@/lib/terminal/commands/image";
import type { CommandContext } from "@/lib/terminal/types";

const ctx: CommandContext = { theme: "auto", commands: [imageCommand] };

describe("imageCommand", () => {
  it("is registered under the image slug with the img alias", () => {
    expect(imageCommand.name).toBe("image");
    expect(imageCommand.aliases).toEqual(["img"]);
    expect(imageCommand.slug).toBe("image");
    expect(imageCommand.status).toBe("live");
    expect(imageCommand.category).toBe("Utilities");
  });

  it("opens the panel silently for bare and whitespace args", () => {
    expect(imageCommand.run("", ctx)).toEqual({ type: "open", slug: "image" });
    expect(imageCommand.run("   ", ctx)).toEqual({ type: "open", slug: "image" });
  });

  it("opens with the opens-in-a-panel line when args are given", () => {
    expect(imageCommand.run("anything at all", ctx)).toEqual({
      type: "open",
      slug: "image",
      output: [{ type: "text", text: "Image opens in a panel." }],
    });
  });

  it("never answers or falls back (open-only)", () => {
    for (const args of ["", "resize to 100px", "png 800x600"]) {
      const result = imageCommand.run(args, ctx);
      if (result instanceof Promise) throw new Error("unexpected async result");
      expect(result.type).toBe("open");
      expect(result.type).not.toBe("fallback");
    }
  });
});
