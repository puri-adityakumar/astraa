import { describe, expect, it } from "vitest";
import {
  buildCommandHelp,
  buildHelpOutput,
  commandKey,
  commandValue,
  findHelpTopic,
} from "@/lib/terminal/help";
import { BUILTIN_COMMANDS } from "@/lib/terminal/builtins";
import type { TerminalCommand } from "@/lib/terminal/types";

function fixtureCommand(overrides: Partial<TerminalCommand> = {}): TerminalCommand {
  return {
    name: "calculator",
    aliases: ["calc"],
    summary: "Evaluate arithmetic expressions",
    usage: ["/calculator 2+2"],
    category: "Utilities",
    slug: "calculator",
    status: "live",
    run: () => ({ type: "answer", output: [] }),
    ...overrides,
  };
}

const kvEntries = (blocks: ReturnType<typeof buildHelpOutput>) =>
  blocks.flatMap((b) => (b.type === "kv" ? b.entries : []));

describe("commandKey / commandValue", () => {
  it("formats the key with a leading slash per name and alias", () => {
    expect(commandKey(fixtureCommand())).toBe("/calculator, /calc");
    expect(commandKey(fixtureCommand({ aliases: [] }))).toBe("/calculator");
  });

  it("appends the status marker to the summary", () => {
    expect(commandValue(fixtureCommand())).toBe("Evaluate arithmetic expressions · live");
    expect(commandValue(fixtureCommand({ status: "coming-soon" }))).toBe(
      "Evaluate arithmetic expressions · coming soon",
    );
  });
});

describe("buildHelpOutput", () => {
  it("groups commands by category with a heading per group", () => {
    const commands = [
      ...BUILTIN_COMMANDS,
      fixtureCommand(),
      fixtureCommand({ name: "hash", aliases: [], slug: "calculator", summary: "Hash text" }),
    ];
    const blocks = buildHelpOutput(commands);
    const headings = blocks.flatMap((b) => (b.type === "text" ? [b.text] : []));
    expect(headings[0]).toBe("Built-ins");
    expect(headings).toContain("Utilities");
    expect(headings).toContain("Keyboard");
  });

  it("lists every command with aliases, summary and status marker", () => {
    const commands = [
      ...BUILTIN_COMMANDS,
      fixtureCommand(),
      fixtureCommand({ name: "music", aliases: [], slug: null, status: "coming-soon", summary: "Lofi studio" }),
    ];
    const entries = kvEntries(buildHelpOutput(commands));
    const keys = entries.map((e) => e.key);
    for (const name of ["help", "clear", "theme", "legacy", "calculator", "music"]) {
      expect(keys.some((k) => k.startsWith(`/${name}`))).toBe(true);
    }
    const calc = entries.find((e) => e.key === "/calculator, /calc");
    expect(calc?.value).toBe("Evaluate arithmetic expressions · live");
    const music = entries.find((e) => e.key === "/music");
    expect(music?.value).toBe("Lofi studio · coming soon");
  });

  it("keeps Built-ins first and preserves first-seen order afterwards", () => {
    const commands = [
      fixtureCommand(),
      ...BUILTIN_COMMANDS,
      fixtureCommand({ name: "units", aliases: [], summary: "Convert units" }),
    ];
    const blocks = buildHelpOutput(commands);
    const firstHeading = blocks[0];
    expect(firstHeading?.type).toBe("text");
    if (firstHeading?.type !== "text") return;
    expect(firstHeading.text).toBe("Built-ins");
  });

  it("includes keyboard tips", () => {
    const blocks = buildHelpOutput(BUILTIN_COMMANDS);
    const list = blocks.find((b) => b.type === "list");
    expect(list?.type).toBe("list");
    if (list?.type !== "list") return;
    expect(list.items.length).toBeGreaterThanOrEqual(3);
    expect(list.items.some((i) => i.includes("Ctrl+L"))).toBe(true);
  });
});

describe("buildCommandHelp", () => {
  it("shows the command row and its usage examples", () => {
    const blocks = buildCommandHelp(fixtureCommand());
    expect(blocks).toHaveLength(2);
    const [row, usage] = blocks;
    expect(row?.type).toBe("kv");
    if (row?.type !== "kv") return;
    expect(row.entries[0]?.key).toBe("/calculator, /calc");
    expect(row.entries[0]?.value).toContain("Evaluate arithmetic expressions");
    expect(usage?.type).toBe("list");
    if (usage?.type !== "list") return;
    expect(usage.items).toEqual(["/calculator 2+2"]);
  });
});

describe("findHelpTopic", () => {
  it("finds by name or alias, case-insensitively", () => {
    const commands = [fixtureCommand(), ...BUILTIN_COMMANDS];
    expect(findHelpTopic(commands, "calculator")?.name).toBe("calculator");
    expect(findHelpTopic(commands, "CALC")?.name).toBe("calculator");
    expect(findHelpTopic(commands, "  Theme ")?.name).toBe("theme");
    expect(findHelpTopic(commands, "nope")).toBeUndefined();
  });
});
