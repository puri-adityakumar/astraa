import { evaluateExpression } from "@/lib/calculator/calculator-utils";
import type { CommandContext, CommandResult, TerminalCommand } from "../types";

function fallbackMessage(args: string): string {
  return `I don't understand "${args}". Opening Calculator…`;
}

/**
 * Formats a result without binary floating-point noise (0.1+0.2 → 0.3)
 * while leaving ordinary magnitudes untouched.
 */
function formatResult(value: number): string {
  return String(Number(value.toPrecision(12)));
}

/**
 * /calculator (alias /calc): bare or empty args open the panel; an
 * expression the lib evaluates answers inline as "= <n>". Anything the lib
 * rejects, plus any non-finite result (NaN, ±Infinity — e.g. 5/0), falls
 * back with the "I don't understand" message and opens the panel.
 */
export const calculatorCommand: TerminalCommand = {
  name: "calculator",
  aliases: ["calc"],
  summary: "Open the scientific calculator, or evaluate an expression inline",
  usage: ["/calculator", "/calculator 2+2", "/calculator 2+3*4"],
  category: "Utilities",
  slug: "calculator",
  status: "live",
  run(args: string, _ctx: CommandContext): CommandResult {
    const expression = args.trim();
    if (expression === "") {
      return { type: "open", slug: "calculator" };
    }
    try {
      const result = evaluateExpression(expression);
      if (!Number.isFinite(result)) {
        return { type: "fallback", slug: "calculator", message: fallbackMessage(expression) };
      }
      return {
        type: "answer",
        output: [{ type: "text", text: `= ${formatResult(result)}` }],
      };
    } catch {
      return { type: "fallback", slug: "calculator", message: fallbackMessage(expression) };
    }
  },
};
