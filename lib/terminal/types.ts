/**
 * Pure types for the terminal command system. No React, no next/* imports.
 * Architecture §5: commands return one of four results and the UI renders
 * `output` blocks; the `secret` block is the only way to render a password.
 */
import type { TerminalToolSlug } from "./slugs";
import type { TermTheme } from "./cookies";

/** Folder slug under /tools — the routing gate lives in lib/terminal/slugs.ts. */
export type ToolSlug = TerminalToolSlug;

/** One renderable chunk of command output. */
export type OutputBlock =
  | { type: "text"; text: string }
  | { type: "kv"; entries: { key: string; value: string }[] }
  | { type: "code"; code: string; language?: string }
  | { type: "error"; text: string }
  | { type: "secret"; secret: string }
  | { type: "list"; items: string[] };

/**
 * What the UI must execute for a built-in. /help needs no action (its result
 * is pure output); /clear empties the scrollback; /theme <name> switches the
 * scheme; /legacy switches flavour.
 */
export type BuiltinAction =
  | { kind: "clear" }
  | { kind: "theme"; theme: TermTheme }
  | { kind: "legacy" };

/** Environment passed to every command run. */
export interface CommandContext {
  /** Active terminal theme id ("auto" or a scheme id) — used by /theme. */
  theme: TermTheme;
  /** All registered commands, fresh from the registry — used by /help. */
  commands: readonly TerminalCommand[];
}

export type CommandResult =
  | { type: "answer"; output: OutputBlock[] } // render inline in the scrollback
  | { type: "open"; slug: ToolSlug; output?: OutputBlock[] } // open the tool panel
  | { type: "fallback"; slug: ToolSlug; message: string } // "I don't understand" + panel
  | { type: "builtin"; action: BuiltinAction; output?: OutputBlock[] };

export interface TerminalCommand {
  /** Command name without the leading slash. */
  name: string;
  aliases: string[];
  /** One-line description shown by /help and the suggestion list. */
  summary: string;
  /** Usage examples shown by /help <command>. */
  usage: string[];
  /** Matches lib/tools.ts category names; built-ins use "Built-ins". */
  category: string;
  /** null for built-ins. */
  slug: ToolSlug | null;
  status: "live" | "coming-soon";
  run(args: string, ctx: CommandContext): CommandResult | Promise<CommandResult>;
}
