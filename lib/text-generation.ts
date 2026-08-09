const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

const MAX_TOPIC_LENGTH = 500;
const MIN_WORD_COUNT = 10;
export const MAX_WORD_COUNT = 1_000;

export type TextGenerationValidation =
  { ok: true; topic: string; wordCount: number } | { ok: false; message: string };

export function validateTextGenerationRequest(
  topic: unknown,
  wordCount: unknown,
): TextGenerationValidation {
  if (typeof topic !== "string" || topic.trim().length === 0) {
    return { ok: false, message: "Enter a topic before generating text." };
  }

  const normalizedTopic = topic.trim();
  if (normalizedTopic.length > MAX_TOPIC_LENGTH) {
    return {
      ok: false,
      message: `Topic must be ${MAX_TOPIC_LENGTH} characters or fewer.`,
    };
  }

  if (typeof wordCount !== "number" || !Number.isInteger(wordCount)) {
    return { ok: false, message: "Word count must be a whole number." };
  }

  if (wordCount < MIN_WORD_COUNT || wordCount > MAX_WORD_COUNT) {
    return {
      ok: false,
      message: `Word count must be between ${MIN_WORD_COUNT} and ${MAX_WORD_COUNT}.`,
    };
  }

  return { ok: true, topic: normalizedTopic, wordCount };
}

export async function requestGeneratedText(
  topic: string,
  wordCount: number,
  apiKey: string,
  signal: AbortSignal,
  fetchImplementation: typeof fetch = fetch,
): Promise<string> {
  const response = await fetchImplementation(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      messages: [
        {
          role: "system",
          content:
            "Generate coherent placeholder prose for the requested topic. " +
            "Do not include a title, list, or Markdown unless the prose requires it.",
        },
        {
          role: "user",
          content: `Write approximately ${wordCount} words about: ${topic}`,
        },
      ],
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed with status ${response.status}`);
  }

  const payload: unknown = await response.json();
  const text = readGeneratedText(payload);
  if (!text) throw new Error("OpenRouter returned no text");
  return text;
}

function readGeneratedText(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const choices = (payload as Record<string, unknown>).choices;
  if (!Array.isArray(choices)) return null;
  const firstChoice = choices[0];
  if (typeof firstChoice !== "object" || firstChoice === null) return null;
  const message = (firstChoice as Record<string, unknown>).message;
  if (typeof message !== "object" || message === null) return null;
  const content = (message as Record<string, unknown>).content;
  return typeof content === "string" && content.trim().length > 0 ? content.trim() : null;
}
