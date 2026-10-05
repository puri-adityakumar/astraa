import { describe, expect, it } from "vitest";
import {
  LOREM_LIMITS,
  generateLorem,
  parseLoremUnit,
  type RandomGenerator,
} from "@/lib/text/lorem";

/** Deterministic LCG so every test is reproducible. */
function seeded(seed: number): RandomGenerator {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Split prose into sentences (words never contain periods). */
function sentences(paragraph: string): string[] {
  return paragraph.replace(/\.$/, "").split(/\. /);
}

describe("parseLoremUnit", () => {
  it("accepts plural and singular forms case-insensitively", () => {
    expect(parseLoremUnit("words")).toBe("words");
    expect(parseLoremUnit("word")).toBe("words");
    expect(parseLoremUnit("WORDS")).toBe("words");
    expect(parseLoremUnit("Words")).toBe("words");
    expect(parseLoremUnit("sentences")).toBe("sentences");
    expect(parseLoremUnit("sentence")).toBe("sentences");
    expect(parseLoremUnit("Sentence")).toBe("sentences");
    expect(parseLoremUnit("paragraphs")).toBe("paragraphs");
    expect(parseLoremUnit("paragraph")).toBe("paragraphs");
    expect(parseLoremUnit("Paragraph")).toBe("paragraphs");
  });

  it("rejects unknown units", () => {
    expect(parseLoremUnit("zorp")).toBeNull();
    expect(parseLoremUnit("characters")).toBeNull();
    expect(parseLoremUnit("")).toBeNull();
  });
});

describe("LOREM_LIMITS", () => {
  it("pins the terminal limits per unit", () => {
    expect(LOREM_LIMITS.words).toEqual({ min: 1, max: 1000 });
    expect(LOREM_LIMITS.sentences).toEqual({ min: 1, max: 100 });
    expect(LOREM_LIMITS.paragraphs).toEqual({ min: 1, max: 20 });
  });
});

describe("generateLorem — words", () => {
  it("produces exactly the classic opening for 5 words", () => {
    expect(generateLorem({ count: 5, unit: "words" })).toBe(
      "Lorem ipsum dolor sit amet",
    );
  });

  it("truncates the opening for counts under 5", () => {
    expect(generateLorem({ count: 1, unit: "words" })).toBe("Lorem");
    expect(generateLorem({ count: 2, unit: "words" })).toBe("Lorem ipsum");
    expect(generateLorem({ count: 3, unit: "words" })).toBe("Lorem ipsum dolor");
  });

  it("keeps the opening then random words for larger counts", () => {
    const text = generateLorem({ count: 12, unit: "words", random: seeded(7) });
    expect(text.startsWith("Lorem ipsum dolor sit amet ")).toBe(true);
    expect(text.split(" ")).toHaveLength(12);
  });

  it("omits the opening when startWithLorem is false", () => {
    const text = generateLorem({
      count: 6,
      unit: "words",
      startWithLorem: false,
      random: seeded(42),
    });
    expect(text.startsWith("Lorem ipsum dolor sit amet")).toBe(false);
    expect(text.split(" ")).toHaveLength(6);
  });

  it("is deterministic for a fixed RNG", () => {
    const a = generateLorem({ count: 30, unit: "words", random: seeded(1) });
    const b = generateLorem({ count: 30, unit: "words", random: seeded(1) });
    expect(a).toBe(b);
  });

  it("generates the maximum of 1000 words", () => {
    const text = generateLorem({ count: 1000, unit: "words" });
    expect(text.split(" ")).toHaveLength(1000);
  });
});

describe("generateLorem — sentences", () => {
  it("starts with the classic opening and ends each sentence with a period", () => {
    const text = generateLorem({ count: 3, unit: "sentences", random: seeded(3) });
    expect(text.startsWith("Lorem ipsum dolor sit amet")).toBe(true);
    expect(text.endsWith(".")).toBe(true);
    const parts = sentences(text);
    expect(parts).toHaveLength(3);
    for (const sentence of parts) {
      expect(sentence.charAt(0)).toMatch(/[A-Z]/);
    }
  });

  it("accepts a single sentence", () => {
    const text = generateLorem({ count: 1, unit: "sentences", random: seeded(5) });
    expect(sentences(text)).toHaveLength(1);
    expect(text.startsWith("Lorem ipsum dolor sit amet")).toBe(true);
    expect(text.endsWith(".")).toBe(true);
  });

  it("generates the maximum of 100 sentences", () => {
    const text = generateLorem({ count: 100, unit: "sentences", random: seeded(9) });
    expect(sentences(text)).toHaveLength(100);
  });
});

describe("generateLorem — paragraphs", () => {
  it("joins two paragraphs with a blank line, each starting Lorem ipsum", () => {
    const text = generateLorem({ count: 2, unit: "paragraphs", random: seeded(11) });
    const paragraphs = text.split("\n\n");
    expect(paragraphs).toHaveLength(2);
    for (const paragraph of paragraphs) {
      expect(paragraph.startsWith("Lorem ipsum")).toBe(true);
      expect(sentences(paragraph).length).toBeGreaterThanOrEqual(2);
      expect(paragraph.endsWith(".")).toBe(true);
    }
  });

  it("emits no blank line for a single paragraph", () => {
    const text = generateLorem({ count: 1, unit: "paragraphs", random: seeded(13) });
    expect(text.includes("\n\n")).toBe(false);
    expect(text.startsWith("Lorem ipsum")).toBe(true);
  });

  it("generates the maximum of 20 paragraphs", () => {
    const text = generateLorem({ count: 20, unit: "paragraphs", random: seeded(17) });
    expect(text.split("\n\n")).toHaveLength(20);
  });

  it("is deterministic for a fixed RNG", () => {
    const a = generateLorem({ count: 3, unit: "paragraphs", random: seeded(19) });
    const b = generateLorem({ count: 3, unit: "paragraphs", random: seeded(19) });
    expect(a).toBe(b);
  });
});

describe("generateLorem — limits", () => {
  it("throws a RangeError below each unit's minimum", () => {
    expect(() => generateLorem({ count: 0, unit: "words" })).toThrow(RangeError);
    expect(() => generateLorem({ count: 0, unit: "sentences" })).toThrow(RangeError);
    expect(() => generateLorem({ count: 0, unit: "paragraphs" })).toThrow(RangeError);
    expect(() => generateLorem({ count: -1, unit: "words" })).toThrow(RangeError);
  });

  it("throws a RangeError above each unit's maximum", () => {
    expect(() => generateLorem({ count: 1001, unit: "words" })).toThrow(RangeError);
    expect(() => generateLorem({ count: 101, unit: "sentences" })).toThrow(RangeError);
    expect(() => generateLorem({ count: 21, unit: "paragraphs" })).toThrow(RangeError);
  });

  it("throws a RangeError for non-integer and non-finite counts", () => {
    expect(() => generateLorem({ count: 1.5, unit: "words" })).toThrow(RangeError);
    expect(() => generateLorem({ count: Number.NaN, unit: "words" })).toThrow(RangeError);
    expect(() => generateLorem({ count: Number.POSITIVE_INFINITY, unit: "words" })).toThrow(
      RangeError,
    );
  });

  it("throws a TypeError for an unknown unit", () => {
    expect(() =>
      generateLorem({ count: 5, unit: "zorp" as never }),
    ).toThrow(TypeError);
  });
});
