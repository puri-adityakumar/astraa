import { describe, expect, it, vi } from "vitest";

import { parseContributors, requestContributors } from "./contributors-service";

const VALID_CONTRIBUTOR = {
  id: 42,
  login: "community-dev",
  avatar_url: "https://avatars.githubusercontent.com/u/42?v=4",
  html_url: "https://github.com/community-dev",
  contributions: 7,
};

describe("GitHub contributor service", () => {
  it("parses only allowlisted contributor fields", () => {
    expect(
      parseContributors([{ ...VALID_CONTRIBUTOR, private_email: "hidden@example.com" }]),
    ).toEqual([
      {
        id: 42,
        login: "community-dev",
        avatarUrl: "https://avatars.githubusercontent.com/u/42?v=4",
        profileUrl: "https://github.com/community-dev",
        contributions: 7,
      },
    ]);
  });

  it("filters the founder, known bots, and bot suffixes in one place", () => {
    expect(
      parseContributors([
        VALID_CONTRIBUTOR,
        { ...VALID_CONTRIBUTOR, id: 1, login: "puri-adityakumar" },
        { ...VALID_CONTRIBUTOR, id: 2, login: "dependabot[bot]" },
        { ...VALID_CONTRIBUTOR, id: 3, login: "custom[bot]" },
      ]),
    ).toHaveLength(1);
  });

  it("rejects malformed top-level and unsafe URL data", () => {
    expect(parseContributors({ data: [] })).toBeNull();
    expect(
      parseContributors([
        { ...VALID_CONTRIBUTOR, avatar_url: "http://example.com/avatar.png" },
        { ...VALID_CONTRIBUTOR, html_url: "https://example.com/profile" },
      ]),
    ).toEqual([]);
  });

  it("uses a bounded cacheable server request", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify([VALID_CONTRIBUTOR]), { status: 200 }));

    await expect(requestContributors(fetchMock)).resolves.toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "https://api.github.com/repos/puri-adityakumar/astraa/contributors?per_page=20",
    );
    expect(fetchMock.mock.calls[0]?.[1]?.next).toEqual({ revalidate: 3_600 });
    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it("returns a static fallback for rate limits, malformed JSON, and timeouts", async () => {
    const rateLimited = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("rate limited", { status: 429 }));
    const malformed = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("not-json", { status: 200 }));
    const timedOut = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new DOMException("timed out", "TimeoutError"));

    await expect(requestContributors(rateLimited)).resolves.toEqual([]);
    await expect(requestContributors(malformed)).resolves.toEqual([]);
    await expect(requestContributors(timedOut)).resolves.toEqual([]);
  });
});
