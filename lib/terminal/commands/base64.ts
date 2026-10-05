import {
  decodeToText,
  encodeText,
  validateBase64,
} from "@/lib/base64";
import type { CommandContext, CommandResult, TerminalCommand } from "../types";

function fallbackMessage(args: string): string {
  return `I don't understand "${args}". Opening Base64…`;
}

/**
 * /base64 (alias /b64): bare or empty args open the panel. The default
 * action encodes the whole args as UTF-8; "encode <text>" is the explicit
 * form. "decode <b64>" and "-d <b64>" validate with the lib's
 * validateBase64 (the raw decoder alone is lenient) and decode to text.
 * Anything else falls back with the "I don't understand" message and opens
 * the panel.
 */
export const base64Command: TerminalCommand = {
  name: "base64",
  aliases: ["b64"],
  summary: "Encode text to Base64 or decode Base64 inline",
  usage: ["/base64", "/base64 hello", "/base64 decode aGVsbG8=", "/base64 -d aGVsbG8="],
  category: "Developer Tools",
  slug: "base64",
  status: "live",
  run(args: string, _ctx: CommandContext): CommandResult {
    const input = args.trim();
    if (input === "") {
      return { type: "open", slug: "base64" };
    }

    const encoding = (text: string): CommandResult => ({
      type: "answer",
      output: [{ type: "code", code: encodeText(text, { urlSafe: false, wrap76: false }) }],
    });

    const firstSpace = input.indexOf(" ");
    const keyword = firstSpace === -1 ? input : input.slice(0, firstSpace);
    const rest =
      firstSpace === -1 ? "" : input.slice(firstSpace + 1).trimStart();
    // Keywords are case-insensitive; the payload after them keeps its case.
    const keywordLower = keyword.toLowerCase();

    if (keywordLower === "encode") {
      if (rest === "") {
        return { type: "fallback", slug: "base64", message: fallbackMessage(input) };
      }
      return encoding(rest);
    }
    if (keywordLower === "decode" || keywordLower === "-d") {
      if (rest === "" || !validateBase64(rest, { urlSafe: false }).ok) {
        return { type: "fallback", slug: "base64", message: fallbackMessage(input) };
      }
      return {
        type: "answer",
        output: [
          { type: "code", code: decodeToText(rest, { urlSafe: false, wrap76: false }) },
        ],
      };
    }

    return encoding(input);
  },
};
