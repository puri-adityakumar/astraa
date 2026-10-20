import { describe, expect, it } from "vitest";
import { textCommand, runText } from "@/lib/terminal/commands/text";
import type { CommandContext } from "@/lib/terminal/types";

const ctx: CommandContext = { theme: "auto", commands: [textCommand] };

function outputText(result: ReturnType<typeof runText>): string {
  expect(result.type).toBe("answer");
  if (result.type !== "answer") throw new Error("unreachable");
  expect(result.output).toHaveLength(1);
  const block = result.output[0];
  expect(block?.type).toBe("text");
  return block?.type === "text" ? block.text : "";
}

describe("runText", () => {
  it("opens the panel for bare and whitespace args", () => {
    expect(runText("")).toEqual({ type: "open", slug: "text" });
    expect(runText("   ")).toEqual({ type: "open", slug: "text" });
  });

  it("answers 5 words with exactly the classic opening", () => {
    const result = runText("5 words");
    expect(result).toEqual({
      type: "answer",
      output: [{ type: "text", text: "Lorem ipsum dolor sit amet" }],
    });
  });

  it("answers 2 paragraphs separated by a blank line", () => {
    const text = outputText(runText("2 paragraphs"));
    const paragraphs = text.split("\n\n");
    expect(paragraphs).toHaveLength(2);
    for (const paragraph of paragraphs) {
      expect(paragraph.startsWith("Lorem ipsum")).toBe(true);
      expect(paragraph.endsWith(".")).toBe(true);
    }
  });

  it("accepts singular units", () => {
    expect(outputText(runText("3 word")).split(" ")).toHaveLength(3);
    expect(outputText(runText("2 sentence")).split(/\. /)).toHaveLength(2);
    const oneParagraph = outputText(runText("1 paragraph"));
    expect(oneParagraph.includes("\n\n")).toBe(false);
    expect(oneParagraph.startsWith("Lorem ipsum")).toBe(true);
  });

  it("matches units case-insensitively", () => {
    expect(outputText(runText("5 WORDS"))).toBe("Lorem ipsum dolor sit amet");
    expect(outputText(runText("5 Words"))).toBe("Lorem ipsum dolor sit amet");
  });

  it("falls back with the exact message for out-of-range counts", () => {
    for (const input of ["0 words", "21 paragraphs", "1001 words", "-1 words"]) {
      expect(runText(input)).toEqual({
        type: "fallback",
        slug: "text",
        message: `I don't understand "${input}". Opening Text…`,
      });
    }
  });

  it("falls back for non-numeric counts and bad units", () => {
    for (const input of ["abc words", "five words", "5 zorp", "5.5 words"]) {
      expect(runText(input)).toEqual({
        type: "fallback",
        slug: "text",
        message: `I don't understand "${input}". Opening Text…`,
      });
    }
  });

  it("falls back for malformed grammars", () => {
    for (const input of ["5", "words", "5 words please", "lorem ipsum dolor"]) {
      expect(runText(input)).toEqual({
        type: "fallback",
        slug: "text",
        message: `I don't understand "${input}". Opening Text…`,
      });
    }
  });
});

describe("textCommand", () => {
  it("is registered under the text slug with the lorem alias", () => {
    expect(textCommand.name).toBe("text");
    expect(textCommand.aliases).toContain("lorem");
    expect(textCommand.slug).toBe("text");
    expect(textCommand.status).toBe("live");
    expect(textCommand.category).toBe("Utilities");
  });

  it("answers through the command entry point", () => {
    expect(textCommand.run("5 words", ctx)).toEqual({
      type: "answer",
      output: [{ type: "text", text: "Lorem ipsum dolor sit amet" }],
    });
  });
});
