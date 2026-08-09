import { describe, expect, it, vi } from "vitest";

import {
  MAX_WORD_COUNT,
  requestGeneratedText,
  validateTextGenerationRequest,
} from "./text-generation";

describe("text generation", () => {
  it("normalizes a valid request", () => {
    expect(validateTextGenerationRequest("  coffee  ", 100)).toEqual({
      ok: true,
      topic: "coffee",
      wordCount: 100,
    });
  });

  it("rejects requests beyond the server word limit", () => {
    expect(validateTextGenerationRequest("coffee", MAX_WORD_COUNT + 1)).toMatchObject({
      ok: false,
    });
  });

  it("rejects fractional word counts and empty topics", () => {
    expect(validateTextGenerationRequest("coffee", 10.5)).toMatchObject({ ok: false });
    expect(validateTextGenerationRequest("   ", 100)).toMatchObject({ ok: false });
  });

  it("parses generated content without exposing the API key in the body", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: "Generated prose" } }] }), {
        status: 200,
      }),
    );

    await expect(
      requestGeneratedText("coffee", 100, "private-key", new AbortController().signal, fetchMock),
    ).resolves.toBe("Generated prose");

    const request = fetchMock.mock.calls[0];
    expect(String(request?.[1]?.body)).not.toContain("private-key");
    expect(request?.[1]?.headers).toMatchObject({
      Authorization: "Bearer private-key",
    });
  });

  it("rejects malformed provider payloads", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ choices: [] }), { status: 200 }));

    await expect(
      requestGeneratedText("coffee", 100, "private-key", new AbortController().signal, fetchMock),
    ).rejects.toThrow("no text");
  });
});
