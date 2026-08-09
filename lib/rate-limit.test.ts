import { describe, expect, it } from "vitest";

import { createRateLimitIdentity, MemoryRateLimitStore } from "./rate-limit";

describe("rate limiting", () => {
  it("blocks requests after the configured limit and resets after expiry", async () => {
    let now = 1_000;
    const store = new MemoryRateLimitStore(() => now);

    for (let request = 0; request < 5; request += 1) {
      await expect(store.consume("visitor", 5, 600)).resolves.toMatchObject({
        allowed: true,
      });
    }
    await expect(store.consume("visitor", 5, 600)).resolves.toMatchObject({
      allowed: false,
      remaining: 0,
    });

    now += 600_001;
    await expect(store.consume("visitor", 5, 600)).resolves.toMatchObject({
      allowed: true,
      remaining: 4,
    });
  });

  it("hashes the request identity with a server salt", () => {
    const identity = createRateLimitIdentity("203.0.113.2", "test-salt");

    expect(identity).toMatch(/^[a-f0-9]{64}$/);
    expect(identity).not.toContain("203.0.113.2");
    expect(createRateLimitIdentity("203.0.113.2", "another-salt")).not.toBe(identity);
  });
});
