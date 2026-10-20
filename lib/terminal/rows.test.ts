import { describe, expect, it } from "vitest";
import { commandsInCategory, toolCommands } from "./rows";
import type { TerminalCommand } from "./types";

function command(overrides: Partial<TerminalCommand> & { name: string }): TerminalCommand {
  return {
    aliases: [],
    summary: `${overrides.name} summary`,
    usage: [`/${overrides.name}`],
    category: "Utilities",
    slug: null,
    status: "live",
    run: () => ({ type: "answer", output: [] }),
    ...overrides,
  };
}

describe("toolCommands", () => {
  it("returns only commands with a slug, in registry order", () => {
    const help = command({ name: "help", category: "Built-ins" });
    const calculator = command({ name: "calculator", slug: "calculator" });
    const calcAlias = command({
      name: "calc",
      slug: "calculator",
      category: "Developer Tools",
    });
    expect(toolCommands([help, calculator, calcAlias])).toEqual([calculator, calcAlias]);
  });

  it("is empty-safe for an empty registry and a built-ins-only registry", () => {
    expect(toolCommands([])).toEqual([]);
    expect(toolCommands([command({ name: "clear", category: "Built-ins" })])).toEqual([]);
  });
});

describe("commandsInCategory", () => {
  it("returns only that category's tool commands, in registry order", () => {
    const calculator = command({ name: "calculator", slug: "calculator", category: "Utilities" });
    const helper = command({
      name: "calc",
      slug: "calculator",
      category: "Developer Tools",
    });
    const clear = command({ name: "clear", category: "Built-ins" });
    expect(commandsInCategory([calculator, helper, clear], "Utilities")).toEqual([calculator]);
    expect(commandsInCategory([calculator, helper, clear], "Developer Tools")).toEqual([helper]);
  });

  it("includes coming-soon commands so lists can mark them", () => {
    const soon = command({
      name: "soon-calculator",
      slug: "calculator",
      status: "coming-soon",
      category: "Utilities",
    });
    expect(commandsInCategory([soon], "Utilities")).toEqual([soon]);
  });

  it("returns an empty list for unknown categories and empty registries", () => {
    const calculator = command({ name: "calculator", slug: "calculator" });
    expect(commandsInCategory([calculator], "Developer Tools")).toEqual([]);
    expect(commandsInCategory([], "Utilities")).toEqual([]);
  });
});
