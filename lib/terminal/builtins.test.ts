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
  it("defines the live built-ins in order, including the settings alias", () => {
    expect(BUILTIN_COMMANDS.map((c) => c.name)).toEqual([
      "help",
      "clear",
      "config",
      "theme",
      "legacy",
    ]);
    for (const command of BUILTIN_COMMANDS) {
      expect(command.category).toBe("Built-ins");
      expect(command.slug).toBeNull();
      expect(command.status).toBe("live");
      expect(command.aliases).toEqual(command.name === "config" ? ["settings"] : []);
      expect(command.usage.length).toBeGreaterThan(0);
    }
  });
});

describe("/config", () => {
  const config = BUILTIN_COMMANDS.find((command) => command.name === "config");
  const theme = BUILTIN_COMMANDS.find((command) => command.name === "theme");

  it("opens the settings panel and provides an announcement", async () => {
    expect(await config?.run(" \t ", ctx)).toEqual({
      type: "builtin",
      action: { kind: "config" },
      output: [{ type: "text", text: "Opening settings." }],
    });
  });

  it.each(TERM_THEMES)("reuses /theme for the valid scheme %s", async (name) => {
    expect(await config?.run(`ThEmE \t ${name.toUpperCase()} `, ctx)).toEqual(
      await theme?.run(name, ctx),
    );
  });

  it("lists themes when the theme subcommand has no value", async () => {
    expect(await config?.run("theme", ctx)).toEqual(await theme?.run("", ctx));
  });

  it.each(["unknown", "mocha latte"])("reuses theme errors for %j", async (name) => {
    const result = await config?.run(`theme ${name}`, ctx);
    expect(result).toEqual(await theme?.run(name, ctx));
    expect(expectAnswer(result)[0]?.type).toBe("error");
  });

  it.each(["legacy", " InTerFace \t LEGACY "])("switches interface for %j", async (args) => {
    expect(await config?.run(args, ctx)).toEqual({
      type: "builtin",
      action: { kind: "legacy" },
    });
  });

  it.each(["unknown", "interface", "interface terminal", "legacy extra"])(
    "provides valid subcommands for unsupported input %j",
    async (args) => {
      const block = expectAnswer(await config?.run(args, ctx))[0];
      expect(block?.type).toBe("error");
      if (block?.type !== "error") return;
      expect(block.text).toContain("/config theme <name>");
      expect(block.text).toContain("/config interface legacy");
      expect(block.text).toContain("/config legacy");
    },
  );
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
    const output = expectAnswer(
      await theme?.run("", { theme: "auto", commands: BUILTIN_COMMANDS }),
    );
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
