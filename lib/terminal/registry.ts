/**
 * The terminal command registry: the command list (built-ins + registered
 * tools), case-insensitive resolution, autocomplete suggestions, "did you
 * mean" via edit distance, and runInput — the entry point that applies the
 * universal rules (architecture §5) and never throws.
 */
import { parseInput } from "./parse";
import { BUILTIN_COMMANDS } from "./builtins";
import { calculatorCommand } from "./commands/calculator";
import { unitsCommand } from "./commands/units";
import { base64Command } from "./commands/base64";
import { hashCommand } from "./commands/hash";
import { regexCommand } from "./commands/regex";
import { jsonCommand } from "./commands/json";
import { passwordCommand } from "./commands/password";
import { currencyCommand } from "./commands/currency";
import { textCommand } from "./commands/text";
import { imageCommand } from "./commands/image";
import { markdownCommand } from "./commands/markdown";
import { snippetCommand } from "./commands/snippet";
import { musicCommand } from "./commands/music";
import { sqlCommand } from "./commands/sql";
import type { CommandContext, CommandResult, OutputBlock, TerminalCommand, ToolSlug } from "./types";

const commands: TerminalCommand[] = [
  ...BUILTIN_COMMANDS,
  calculatorCommand,
  unitsCommand,
  base64Command,
  hashCommand,
  regexCommand,
  jsonCommand,
  passwordCommand,
  currencyCommand,
  textCommand,
  imageCommand,
  markdownCommand,
  snippetCommand,
  musicCommand,
  sqlCommand,
];

/** All registered commands, built-ins first, in registration order. */
export function getCommands(): readonly TerminalCommand[] {
  return commands;
}

/**
 * Register a tool command (at module init or when a panel feature loads).
 * Returns the unregister function, used by tests and dynamic registration.
 */
export function register(command: TerminalCommand): () => void {
  commands.push(command);
  return () => {
    const index = commands.indexOf(command);
    if (index !== -1) commands.splice(index, 1);
  };
}

export function resolveCommandIn(
  all: readonly TerminalCommand[],
  name: string,
): TerminalCommand | undefined {
  const needle = name.toLowerCase();
  return all.find(
    (c) =>
      c.name.toLowerCase() === needle ||
      c.aliases.some((a) => a.toLowerCase() === needle),
  );
}

/** Resolve by name or alias, case-insensitively. */
export function resolveCommand(name: string): TerminalCommand | undefined {
  return resolveCommandIn(commands, name);
}

/** The registered command for a tool slug, if any (built-ins have none). */
export function commandForSlug(slug: ToolSlug): TerminalCommand | undefined {
  return commands.find((c) => c.slug === slug);
}

export function suggestIn(
  all: readonly TerminalCommand[],
  prefix: string,
): TerminalCommand[] {
  const needle = prefix.trim().toLowerCase().replace(/^\/+/, "");
  return all.filter(
    (c) =>
      c.name.toLowerCase().startsWith(needle) ||
      c.aliases.some((a) => a.toLowerCase().startsWith(needle)),
  );
}

/** Commands whose name or alias starts with the prefix (leading "/" allowed). */
export function suggest(prefix: string): TerminalCommand[] {
  return suggestIn(commands, prefix);
}

/** Classic Levenshtein edit distance on lowercased inputs. */
function editDistance(a: string, b: string): number {
  const previous = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) previous[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let diagonal = previous[0] ?? 0;
    previous[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = previous[j] ?? 0;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const candidate = Math.min(above + 1, (previous[j - 1] ?? 0) + 1, diagonal + cost);
      diagonal = above;
      previous[j] = candidate;
    }
  }
  return previous[b.length] ?? 0;
}

export function closestCommandIn(
  all: readonly TerminalCommand[],
  name: string,
): TerminalCommand | undefined {
  const needle = name.toLowerCase();
  let best: TerminalCommand | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const command of all) {
    for (const candidate of [command.name, ...command.aliases]) {
      const distance = editDistance(needle, candidate.toLowerCase());
      if (distance < bestDistance) {
        bestDistance = distance;
        best = command;
      }
    }
  }
  return bestDistance <= 2 ? best : undefined;
}

/** Closest registered command within edit distance 2, for "did you mean". */
export function closestCommand(name: string): TerminalCommand | undefined {
  return closestCommandIn(commands, name);
}

export const HELP_HINT = "Type /help to see all commands.";
export const NON_SLASH_MESSAGE = `Commands start with "/". ${HELP_HINT}`;

/**
 * Run a raw input line through the universal rules (architecture §5):
 * empty → null (no-op); non-slash text → guidance message; unknown command →
 * error + optional "did you mean" + help hint; otherwise the command's own
 * result. Failures inside a command become an error block — this never throws.
 */
export async function runInput(
  raw: string,
  theme: CommandContext["theme"],
): Promise<CommandResult | null> {
  const parsed = parseInput(raw);
  if (parsed.kind === "empty") return null;
  if (parsed.kind === "text") {
    return { type: "answer", output: [{ type: "error", text: NON_SLASH_MESSAGE }] };
  }
  const command = resolveCommand(parsed.name);
  if (!command) {
    const output: OutputBlock[] = [
      { type: "error", text: `Unknown command "/${parsed.name}".` },
    ];
    const close = closestCommandIn(commands, parsed.name);
    if (close) output.push({ type: "text", text: `Did you mean /${close.name}?` });
    output.push({ type: "text", text: HELP_HINT });
    return { type: "answer", output };
  }
  const ctx: CommandContext = { theme, commands };
  try {
    return await command.run(parsed.args, ctx);
  } catch {
    return {
      type: "answer",
      output: [{ type: "error", text: `/${command.name} failed to run. ${HELP_HINT}` }],
    };
  }
}
