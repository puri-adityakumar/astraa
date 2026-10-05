import { generateHash, hashAlgorithms } from "@/lib/hash";
import type { CommandContext, CommandResult, TerminalCommand } from "../types";

function fallbackMessage(args: string): string {
  return `I don't understand "${args}". Opening Hash…`;
}

/**
 * /hash: bare or empty args open the panel. "<text>" hashes with sha256;
 * "<algo> <text>" hashes with the named algorithm — the first token is an
 * algorithm only when it matches one of the lib's hashAlgorithms ids
 * (case-insensitive), so unknown tokens like "sha999" are hashed as text.
 * An algorithm name with no text falls back with the "I don't understand"
 * message and opens the panel.
 */
export const hashCommand: TerminalCommand = {
  name: "hash",
  aliases: [],
  summary: "Hash text with md5, sha1, sha256, sha512 or sha3 inline",
  usage: ["/hash", "/hash hello", "/hash md5 hello", "/hash sha512 hello"],
  category: "Utilities",
  slug: "hash",
  status: "live",
  run(args: string, _ctx: CommandContext): CommandResult {
    const input = args.trim();
    if (input === "") {
      return { type: "open", slug: "hash" };
    }

    const firstSpace = input.indexOf(" ");
    const first = firstSpace === -1 ? input : input.slice(0, firstSpace);
    const named = hashAlgorithms.find((a) => a.id === first.toLowerCase());
    if (named && firstSpace === -1) {
      return { type: "fallback", slug: "hash", message: fallbackMessage(input) };
    }

    const algorithm = named?.id ?? "sha256";
    const text = named ? input.slice(firstSpace + 1).trimStart() : input;
    const digest = generateHash(text, algorithm);
    return {
      type: "answer",
      output: [{ type: "code", code: `${algorithm} ${digest}` }],
    };
  },
};
