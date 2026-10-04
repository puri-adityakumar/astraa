/**
 * The four built-in commands: /help, /clear, /theme, /legacy. Their results
 * are either pure output (/help, /theme list, errors) or BuiltinActions the
 * UI executes (clear the scrollback, switch the scheme, switch flavour).
 */
import { isTermTheme, TERM_THEMES, type TermTheme } from "./cookies";
import {
  BUILTIN_CATEGORY,
  buildCommandHelp,
  buildHelpOutput,
  findHelpTopic,
} from "./help";
import { SCHEMES } from "./themes";
import type { CommandContext, CommandResult, OutputBlock, TerminalCommand } from "./types";

/** The 7-option scheme list (6 schemes + auto) with the active one marked. */
export function buildThemeList(active: TermTheme): OutputBlock {
  const entries = [
    ...SCHEMES.map((scheme) => ({
      key: scheme.id,
      value: scheme.kind === "dark" ? "dark" : "light",
    })),
    {
      key: "auto",
      value: "follows the system setting (mocha in dark mode, latte in light mode)",
    },
  ];
  return {
    type: "kv",
    entries: entries.map((entry) => ({
      key: entry.key === active ? `${entry.key} — active` : entry.key,
      value: entry.value,
    })),
  };
}

const helpCommand: TerminalCommand = {
  name: "help",
  aliases: [],
  summary: "List every command with usage",
  usage: ["/help", "/help <command>"],
  category: BUILTIN_CATEGORY,
  slug: null,
  status: "live",
  run(args: string, ctx: CommandContext): CommandResult {
    const topic = args.trim();
    if (topic === "") return { type: "answer", output: buildHelpOutput(ctx.commands) };
    const target = findHelpTopic(ctx.commands, topic);
    if (!target) {
      return {
        type: "answer",
        output: [
          { type: "error", text: `No help for "/${topic}". Type /help to see all commands.` },
        ],
      };
    }
    return { type: "answer", output: buildCommandHelp(target) };
  },
};

const clearCommand: TerminalCommand = {
  name: "clear",
  aliases: [],
  summary: "Clear the screen",
  usage: ["/clear"],
  category: BUILTIN_CATEGORY,
  slug: null,
  status: "live",
  run(): CommandResult {
    return { type: "builtin", action: { kind: "clear" } };
  },
};

const themeCommand: TerminalCommand = {
  name: "theme",
  aliases: [],
  summary: "Change the colour scheme",
  usage: ["/theme", "/theme <name>"],
  category: BUILTIN_CATEGORY,
  slug: null,
  status: "live",
  run(args: string, ctx: CommandContext): CommandResult {
    const requested = args.trim().toLowerCase();
    if (requested === "") {
      return { type: "answer", output: [buildThemeList(ctx.theme)] };
    }
    if (!isTermTheme(requested)) {
      return {
        type: "answer",
        output: [
          {
            type: "error",
            text: `Unknown theme "${requested}". Valid schemes: ${TERM_THEMES.join(", ")}.`,
          },
        ],
      };
    }
    return {
      type: "builtin",
      action: { kind: "theme", theme: requested },
      output: [{ type: "text", text: `Theme set to ${requested}.` }],
    };
  },
};

const legacyCommand: TerminalCommand = {
  name: "legacy",
  aliases: [],
  summary: "Switch to the legacy interface",
  usage: ["/legacy"],
  category: BUILTIN_CATEGORY,
  slug: null,
  status: "live",
  run(): CommandResult {
    return { type: "builtin", action: { kind: "legacy" } };
  },
};

/** Registered into the registry by default, in this order. */
export const BUILTIN_COMMANDS: readonly TerminalCommand[] = [
  helpCommand,
  clearCommand,
  themeCommand,
  legacyCommand,
];
