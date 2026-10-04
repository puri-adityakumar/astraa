import { describe, expect, it } from "vitest";
import { BUILTIN_COMMANDS } from "@/lib/terminal/builtins";
import { TERM_THEMES } from "@/lib/terminal/cookies";
import type { CommandContext, CommandResult, OutputBlock } from "@/lib/terminal/types";

const ctx: CommandContext = {
  theme: "dracula",
  commands: BUILTIN_COMMANDS,
};

/** Asserts the result is an inline answer and returns its output blocks. */
function expectAnswer(result: CommandResult | null | undefined): OutputBlock[] {
  expect(result?.type).toBe("answer");
  if (result?.type !== "answer") return [];
  return result.output;
}

describe("built-in command definitions", () => {
  it("defines exactly help, clear, theme and legacy as live built-ins", () => {
    expect(BUILTIN_COMMANDS.map((c) => c.name)).toEqual(["help", "clear", "theme", "legacy"]);
    for (const command of BUILTIN_COMMANDS) {
      expect(command.category).toBe("Built-ins");
      expect(command.slug).toBeNull();
      expect(command.status).toBe("live");
      expect(command.aliases).toEqual([]);
      expect(command.usage.length).toBeGreaterThan(0);
    }
  });
});

describe("/clear", () => {
  it("returns a clear action with no output", async () => {
    const clear = BUILTIN_COMMANDS.find((c) => c.name === "clear");
    expect(await clear?.run("", ctx)).toEqual({ type: "builtin", action: { kind: "clear" } });
  });
});

describe("/legacy", () => {
  it("returns a legacy action with no output", async () => {
    const legacy = BUILTIN_COMMANDS.find((c) => c.name === "legacy");
    expect(await legacy?.run("", ctx)).toEqual({ type: "builtin", action: { kind: "legacy" } });
  });
});

describe("/theme", () => {
  it("lists all 7 options with the active one marked", async () => {
    const theme = BUILTIN_COMMANDS.find((c) => c.name === "theme");
    const output = expectAnswer(await theme?.run("", ctx));
    const block = output[0];
    expect(block?.type).toBe("kv");
    if (block?.type !== "kv") return;
    expect(block.entries.map((e) => e.key.replace(" — active", ""))).toEqual([
      "mocha",
      "dracula",
      "tokyo-night",
      "latte",
      "solarized-light",
      "rose-pine-dawn",
      "auto",
    ]);
    const active = block.entries.filter((e) => e.key.endsWith(" — active"));
    expect(active).toHaveLength(1);
    expect(active[0]?.key).toBe("dracula — active");
  });

  it("marks auto as following the system setting", async () => {
    const theme = BUILTIN_COMMANDS.find((c) => c.name === "theme");
    const output = expectAnswer(await theme?.run("", { theme: "auto", commands: BUILTIN_COMMANDS }));
    const block = output[0];
    if (block?.type !== "kv") return;
    const auto = block.entries.find((e) => e.key.startsWith("auto"));
    expect(auto?.value).toContain("system");
  });

  it("switches to a valid scheme (case-insensitively) via a theme action", async () => {
    const theme = BUILTIN_COMMANDS.find((c) => c.name === "theme");
    expect(await theme?.run("Dracula", ctx)).toEqual({
      type: "builtin",
      action: { kind: "theme", theme: "dracula" },
      output: [{ type: "text", text: "Theme set to dracula." }],
    });
  });

  it("rejects unknown names with an error listing all valid names", async () => {
    const theme = BUILTIN_COMMANDS.find((c) => c.name === "theme");
    const output = expectAnswer(await theme?.run("nonsense", ctx));
    const block = output[0];
    expect(block?.type).toBe("error");
    if (block?.type !== "error") return;
    expect(block.text).toContain('Unknown theme "nonsense"');
    for (const name of TERM_THEMES) {
      expect(block.text).toContain(name);
    }
  });
});

describe("/help", () => {
  it("lists built-ins when only they are registered", async () => {
    const help = BUILTIN_COMMANDS.find((c) => c.name === "help");
    const output = expectAnswer(await help?.run("", ctx));
    expect(output.length).toBeGreaterThan(0);
  });

  it("shows usage for a topic and an error for an unknown topic", async () => {
    const help = BUILTIN_COMMANDS.find((c) => c.name === "help");
    const known = expectAnswer(await help?.run("theme", ctx));
    expect(known.length).toBeGreaterThan(0);

    const unknown = expectAnswer(await help?.run("nope", ctx));
    const block = unknown[0];
    expect(block?.type).toBe("error");
    if (block?.type !== "error") return;
    expect(block.text).toContain('No help for "/nope"');
  });
});
