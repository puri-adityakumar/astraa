import { describe, expect, it } from "vitest";

import { generateHash } from "./hash-utils";
import { hashAlgorithms } from "./types";

describe("generateHash", () => {
  it("generates MD5 hash", () => {
    expect(generateHash("hello", "md5")).toBe("5d41402abc4b2a76b9719d911017c592");
  });
  it("generates SHA-1 hash", () => {
    expect(generateHash("hello", "sha1")).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
  });
  it("generates SHA-256 hash", () => {
    expect(generateHash("hello", "sha256")).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });
  it("generates SHA-512 hash", () => {
    const hash = generateHash("hello", "sha512");
    expect(hash).toHaveLength(128);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });
  it("returns different hashes for different inputs", () => {
    const hash1 = generateHash("hello", "sha256");
    const hash2 = generateHash("world", "sha256");
    expect(hash1).not.toBe(hash2);
  });
  it("returns same hash for same input (deterministic)", () => {
    const hash1 = generateHash("test", "sha256");
    const hash2 = generateHash("test", "sha256");
    expect(hash1).toBe(hash2);
  });
  it("handles empty string", () => {
    const hash = generateHash("", "sha256");
    expect(hash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });
});

describe("hash algorithm descriptions", () => {
  it("keeps algorithm IDs stable and avoids security superlatives", () => {
    const forbiddenClaims = new RegExp(
      ["ideal for " + "critical", "highly " + "secure", "strong" + "est"].join("|"),
      "i",
    );

    expect(hashAlgorithms.map((algorithm) => algorithm.id)).toEqual([
      "md5",
      "sha1",
      "sha256",
      "sha512",
      "sha3-256",
      "sha3-512",
    ]);
    expect(hashAlgorithms.map((algorithm) => algorithm.description).join(" ")).not.toMatch(
      forbiddenClaims,
    );
  });

  it("identifies collision-broken legacy algorithms", () => {
    for (const algorithmId of ["md5", "sha1"]) {
      const description = hashAlgorithms.find(
        (algorithm) => algorithm.id === algorithmId,
      )?.description;
      expect(description).toMatch(/legacy/i);
      expect(description).toMatch(/collision/i);
    }
  });
});
