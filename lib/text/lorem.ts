/**
 * Local lorem ipsum generator — no network. Classic Latin word bank with a
 * deterministic opening; the RNG is injectable so tests are reproducible.
 * Counts are integers bounded per unit (words 1–1000, sentences 1–100,
 * paragraphs 1–20); violations throw RangeError, unknown units TypeError.
 */
export type LoremUnit = "words" | "sentences" | "paragraphs";

/** RNG contract — `Math.random` compatible, returns [0, 1). */
export type RandomGenerator = () => number;

export interface LoremOptions {
  /** Amount of `unit` to generate; must be an integer within the unit's limits. */
  count: number;
  unit: LoremUnit;
  /** Begin the output with "Lorem ipsum dolor sit amet" (default true). */
  startWithLorem?: boolean;
  /** Injected for determinism; defaults to Math.random. */
  random?: RandomGenerator;
}

export const LOREM_LIMITS: Record<LoremUnit, { min: number; max: number }> = {
  words: { min: 1, max: 1000 },
  sentences: { min: 1, max: 100 },
  paragraphs: { min: 1, max: 20 },
};

const MIN_SENTENCE_WORDS = 6;
const MAX_SENTENCE_WORDS = 12;
const MIN_PARAGRAPH_SENTENCES = 3;
const MAX_PARAGRAPH_SENTENCES = 6;

const OPENING = ["lorem", "ipsum", "dolor", "sit", "amet"] as const;

const WORD_BANK = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "eu",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
];

/** Maps a unit token to a LoremUnit — singular/plural, case-insensitive. */
export function parseLoremUnit(token: string): LoremUnit | null {
  const needle = token.trim().toLowerCase();
  if (needle === "words" || needle === "word") return "words";
  if (needle === "sentences" || needle === "sentence") return "sentences";
  if (needle === "paragraphs" || needle === "paragraph") return "paragraphs";
  return null;
}

function pickWord(random: RandomGenerator): string {
  const index = Math.floor(random() * WORD_BANK.length);
  return WORD_BANK[index] ?? "lorem";
}

function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** Join words capitalising the first: ["lorem","ipsum"] → "Lorem ipsum". */
function joinWords(words: string[]): string {
  const first = capitalise(words[0] ?? "");
  const rest = words.slice(1).join(" ");
  return rest === "" ? first : `${first} ${rest}`;
}

function randomInt(random: RandomGenerator, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}

/** One sentence: capitalised, period-terminated; `opening` seeds its start. */
function buildSentence(random: RandomGenerator, opening?: readonly string[]): string {
  const length = randomInt(random, MIN_SENTENCE_WORDS, MAX_SENTENCE_WORDS);
  const words: string[] = opening ? [...opening] : [];
  const randomWords = Math.max(0, length - words.length);
  for (let i = 0; i < randomWords; i++) words.push(pickWord(random));
  if (words.length === 0) words.push(pickWord(random));
  return `${joinWords(words)}.`;
}

function buildParagraph(random: RandomGenerator, startWithLorem: boolean): string {
  const count = randomInt(random, MIN_PARAGRAPH_SENTENCES, MAX_PARAGRAPH_SENTENCES);
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    sentences.push(
      buildSentence(random, startWithLorem && i === 0 ? OPENING : undefined),
    );
  }
  return sentences.join(" ");
}

/**
 * Generate lorem ipsum text. Deterministic when an injected RNG is given.
 * Throws RangeError for counts outside LOREM_LIMITS or non-integer counts,
 * TypeError for an unknown unit.
 */
export function generateLorem(options: LoremOptions): string {
  const { count, unit, startWithLorem = true, random = Math.random } = options;
  const limits = LOREM_LIMITS[unit];
  if (!limits) {
    throw new TypeError(`Unknown lorem unit: ${String(unit)}`);
  }
  if (!Number.isInteger(count) || count < limits.min || count > limits.max) {
    throw new RangeError(
      `count must be an integer between ${limits.min} and ${limits.max} for unit "${unit}"`,
    );
  }
  switch (unit) {
    case "words": {
      const words: string[] = [];
      for (let i = 0; i < count; i++) {
        words.push(
          startWithLorem && i < OPENING.length
            ? (OPENING[i] ?? "lorem")
            : pickWord(random),
        );
      }
      return words.length > 0 ? joinWords(words) : "";
    }
    case "sentences": {
      const sentences: string[] = [];
      for (let i = 0; i < count; i++) {
        sentences.push(
          buildSentence(random, startWithLorem && i === 0 ? OPENING : undefined),
        );
      }
      return sentences.join(" ");
    }
    case "paragraphs": {
      const paragraphs: string[] = [];
      for (let i = 0; i < count; i++) {
        paragraphs.push(buildParagraph(random, startWithLorem));
      }
      return paragraphs.join("\n\n");
    }
  }
}
