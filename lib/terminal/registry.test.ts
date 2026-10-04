import { describe, expect, it } from "vitest";
import {
  closestCommand,
  closestCommandIn,
  getCommands,
  register,
  resolveCommand,
  resolveCommandIn,
  runInput,
  suggest,
  suggestIn,
} from "@/lib/terminal/registry";
import type { CommandContext, TerminalCommand } from "@/lib/terminal/types";

function fixtureCommand(overrides: Partial<TerminalCommand> = {}): TerminalCommand {
  return {
    name: "calculator",
    aliases: ["calc"],
    summary: "Evaluate arithmetic expressions",
    usage: ["/calculator 2+2"],
    category: "Utilities",
    slug: "calculator",
    status: "live",
    run: () => ({ type: "answer", output: [{ type: "text", text: "= 4" }] }),
    ...overrides,
  };
}

describe("registry list", () => {
  it("starts with the four built-ins in a stable order", () => {
    expect(getCommands().map((c) => c.name)).toEqual(["help", "clear", "theme", "legacy"]);
  });

  it("register() adds a command and the disposer removes it", () => {
    const undo = register(fixtureCommand());
    try {
      expect(getCommands().map((c) => c.name)).toContain("calculator");
    } finally {
      undo();
    }
    expect(getCommands().map((c) => c.name)).not.toContain("calculator");
  });
});

describe("resolveCommand", () => {
  it("resolves built-ins by exact name", () => {
    expect(resolveCommand("help")?.name).toBe("help");
    expect(resolveCommand("clear")?.name).toBe("clear");
  });

  it("resolves names case-insensitively", () => {
    expect(resolveCommand("HELP")?.name).toBe("help");
    expect(resolveCommand("Help")?.name).toBe("help");
  });

  it("resolves aliases case-insensitively once registered", () => {
    const undo = register(fixtureCommand());
    try {
      expect(resolveCommand("calc")?.name).toBe("calculator");
      expect(resolveCommand("CALC")?.name).toBe("calculator");
      expect(resolveCommand("Calculator")?.name).toBe("calculator");
    } finally {
      undo();
    }
  });

  it("returns undefined for unknown names", () => {
    expect(resolveCommand("nope")).toBeUndefined();
    expect(resolveCommand("")).toBeUndefined();
  });

  it("resolveCommandIn works on a provided list", () => {
    const list = [fixtureCommand()];
    expect(resolveCommandIn(list, "CALC")?.name).toBe("calculator");
    expect(resolveCommandIn([], "help")).toBeUndefined();
  });
});

describe("suggest", () => {
  it("suggests every command for an empty prefix", () => {
    expect(suggest("")).toHaveLength(getCommands().length);
    expect(suggest("/")).toHaveLength(getCommands().length);
  });

  it("filters by name and alias prefix, case-insensitively, tolerating a leading slash", () => {
    expect(suggest("th").map((c) => c.name)).toEqual(["theme"]);
    expect(suggest("/th").map((c) => c.name)).toEqual(["theme"]);
    expect(suggest("TH").map((c) => c.name)).toEqual(["theme"]);
  });

  it("matches alias prefixes once registered", () => {
    const units = fixtureCommand({ name: "units", aliases: ["convert"], slug: "calculator" });
    const undo = register(units);
    try {
      expect(suggest("con").map((c) => c.name)).toEqual(["units"]);
      expect(suggest("u").map((c) => c.name)).toEqual(["units"]);
    } finally {
      undo();
    }
  });

  it("suggestIn returns [] when nothing matches", () => {
    expect(suggestIn(getCommands(), "zzz")).toEqual([]);
  });
});

describe("closestCommand", () => {
  it("suggests calculator for the typo 'calculater' once registered", () => {
    const undo = register(fixtureCommand());
    try {
      expect(closestCommand("calculater")?.name).toBe("calculator");
      expect(closestCommand("CALCULATER")?.name).toBe("calculator");
    } finally {
      undo();
    }
    expect(closestCommand("calculater")).toBeUndefined();
  });

  it("suggests built-ins for close typos", () => {
    expect(closestCommand("hlep")?.name).toBe("help");
    expect(closestCommand("clea")?.name).toBe("clear");
  });

  it("returns undefined beyond edit distance 2", () => {
    expect(closestCommand("zzzz")).toBeUndefined();
    expect(closestCommand("xxxxxxxxxx")).toBeUndefined();
  });

  it("closestCommandIn works on a provided list", () => {
    const list = [fixtureCommand()];
    expect(closestCommandIn(list, "calculater")?.name).toBe("calculator");
    expect(closestCommandIn([], "calculater")).toBeUndefined();
  });
});

describe("runInput", () => {
  it("is a no-op for empty and whitespace input", async () => {
    expect(await runInput("", "mocha")).toBeNull();
    expect(await runInput("   ", "mocha")).toBeNull();
    expect(await runInput("\t\n", "mocha")).toBeNull();
  });

  it("answers non-slash input with the exact guidance message", async () => {
    const result = await runInput("hello", "mocha");
    expect(result).toEqual({
      type: "answer",
      output: [{ type: "error", text: 'Commands start with "/". Type /help to see all commands.' }],
    });
  });

  it("reports unknown commands with the hint and no did-you-mean when far", async () => {
    const result = await runInput("/zzzz", "mocha");
    expect(result).toEqual({
      type: "answer",
      output: [
        { type: "error", text: 'Unknown command "/zzzz".' },
        { type: "text", text: "Type /help to see all commands." },
      ],
    });
  });

  it("adds a did-you-mean when a registered command is close", async () => {
    const undo = register(fixtureCommand());
    try {
      const result = await runInput("/calculater", "mocha");
      expect(result).toEqual({
        type: "answer",
        output: [
          { type: "error", text: 'Unknown command "/calculater".' },
          { type: "text", text: "Did you mean /calculator?" },
          { type: "text", text: "Type /help to see all commands." },
        ],
      });
    } finally {
      undo();
    }
  });

  it("runs a resolved command with trimmed args and the context", async () => {
    let seenArgs = "";
    let seenCtx: CommandContext | undefined;
    const undo = register(
      fixtureCommand({
        run: (args, runCtx) => {
          seenArgs = args;
          seenCtx = runCtx;
          return { type: "answer", output: [] };
        },
      }),
    );
    try {
      const result = await runInput("/calculator   2 + 2", "dracula");
      expect(result).toEqual({ type: "answer", output: [] });
      expect(seenArgs).toBe("2 + 2");
      expect(seenCtx?.theme).toBe("dracula");
      expect(seenCtx?.commands).toBe(getCommands());
    } finally {
      undo();
    }
  });

  it("returns the builtin action for /clear and /legacy", async () => {
    expect(await runInput("/clear", "mocha")).toEqual({
      type: "builtin",
      action: { kind: "clear" },
    });
    expect(await runInput("/legacy", "mocha")).toEqual({
      type: "builtin",
      action: { kind: "legacy" },
    });
  });

  it("never throws when a command throws synchronously", async () => {
    const undo = register(
      fixtureCommand({
        name: "explode",
        aliases: [],
        slug: null,
        run: () => {
          throw new Error("boom");
        },
      }),
    );
    try {
      const result = await runInput("/explode", "mocha");
      expect(result?.type).toBe("answer");
      expect(result).toEqual({
        type: "answer",
        output: [{ type: "error", text: "/explode failed to run. Type /help to see all commands." }],
      });
    } finally {
      undo();
    }
  });

  it("never throws when a command rejects asynchronously", async () => {
    const undo = register(
      fixtureCommand({
        name: "explode",
        aliases: [],
        slug: null,
        run: () => Promise.reject(new Error("boom")),
      }),
    );
    try {
      const result = await runInput("/explode", "mocha");
      expect(result?.type).toBe("answer");
    } finally {
      undo();
    }
  });

  it("never throws on pathological input", async () => {
    const weird = "/ / / /";
    const result = await runInput(weird, "mocha");
    expect(result?.type).toBe("answer");
    expect(await runInput("/", "mocha")).toEqual({
      type: "answer",
      output: [
        { type: "error", text: 'Unknown command "/".' },
        { type: "text", text: "Type /help to see all commands." },
      ],
    });
  });
});
