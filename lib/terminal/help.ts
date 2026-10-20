/**
 * Pure /help output builders. Dependency-free (only types) so builtins.ts can
 * use them without importing the registry.
 */
import type { OutputBlock, TerminalCommand } from "./types";

/** Category grouping the built-in commands. */
export const BUILTIN_CATEGORY = "Built-ins";

/** "/calculator, /calc" — the row key used in /help listings. */
export function commandKey(command: TerminalCommand): string {
  const names = ["/" + command.name, ...command.aliases.map((a) => `/${a}`)];
  return names.join(", ");
}

/** "Evaluate arithmetic expressions · live" — the row value used in /help. */
export function commandValue(command: TerminalCommand): string {
  const marker = command.status === "coming-soon" ? "coming soon" : "live";
  return `${command.summary} · ${marker}`;
}

/** Case-insensitive lookup by command name or alias. */
export function findHelpTopic(
  commands: readonly TerminalCommand[],
  topic: string,
): TerminalCommand | undefined {
  const needle = topic.trim().toLowerCase();
  if (needle === "") return undefined;
  return commands.find(
    (c) =>
      c.name.toLowerCase() === needle ||
      c.aliases.some((a) => a.toLowerCase() === needle),
  );
}

/**
 * Full /help output: one heading + one kv block per category (Built-ins
 * first), then keyboard tips.
 */
export function buildHelpOutput(commands: readonly TerminalCommand[]): OutputBlock[] {
  const blocks: OutputBlock[] = [];
  const order: string[] = [];
  const byCategory = new Map<string, TerminalCommand[]>();
  for (const command of commands) {
    let group = byCategory.get(command.category);
    if (!group) {
      group = [];
      byCategory.set(command.category, group);
      order.push(command.category);
    }
    group.push(command);
  }
  const categories = [...order].sort((a, b) => {
    if (a === BUILTIN_CATEGORY) return -1;
    if (b === BUILTIN_CATEGORY) return 1;
    return 0;
  });
  for (const category of categories) {
    const group = byCategory.get(category) ?? [];
    blocks.push({ type: "text", text: category });
    blocks.push({
      type: "kv",
      entries: group.map((command) => ({ key: commandKey(command), value: commandValue(command) })),
    });
  }
  blocks.push({ type: "text", text: "Keyboard" });
  blocks.push({
    type: "list",
    items: [
      "↑ / ↓ recall previous inputs",
      "Tab completes the command name",
      "Ctrl+L clears the screen",
    ],
  });
  blocks.push({ type: "text", text: 'Run /help <command> for usage examples.' });
  return blocks;
}

/** /help <command> output: the command row plus its usage examples. */
export function buildCommandHelp(command: TerminalCommand): OutputBlock[] {
  return [
    { type: "kv", entries: [{ key: commandKey(command), value: commandValue(command) }] },
    { type: "list", items: command.usage },
  ];
}
