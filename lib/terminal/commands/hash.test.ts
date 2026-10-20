import { describe, expect, it } from "vitest";
import { hashCommand } from "./hash";
import type { CommandContext } from "../types";

const ctx: CommandContext = { theme: "auto", commands: [hashCommand] };

async function answerCode(args: string): Promise<string> {
  const result = await hashCommand.run(args, ctx);
  if (result.type !== "answer") {
    throw new Error(`Expected an answer for "${args}", got ${result.type}`);
  }
  return result.output
    .map((block) => (block.type === "code" ? block.code : ""))
    .join("\n");
}

describe("hash command", () => {
  it("opens the panel when called without args", async () => {
    expect(await hashCommand.run("", ctx)).toEqual({ type: "open", slug: "hash" });
  });

  it("opens the panel for whitespace-only args", async () => {
    expect(await hashCommand.run("   ", ctx)).toEqual({ type: "open", slug: "hash" });
  });

  it("hashes the args with sha256 by default", async () => {
    expect(await answerCode("hello")).toBe(
      "sha256 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });

  it("hashes with an explicit md5 algorithm", async () => {
    expect(await answerCode("md5 hello")).toBe(
      "md5 5d41402abc4b2a76b9719d911017c592",
    );
  });

  it("hashes with an explicit sha512 algorithm", async () => {
    expect(await answerCode("sha512 hello")).toBe(
      "sha512 9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043",
    );
  });

  it("supports every algorithm the lib exposes, case-insensitively", async () => {
    expect(await answerCode("SHA1 hello")).toBe(
      "sha1 aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d",
    );
    expect(await answerCode("Sha256 hello")).toBe(
      "sha256 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
    expect(await answerCode("SHA3-256 hello")).toBe(
      "sha3-256 3338be694f50c5f338814986cdf0686453a888b84f424d792af4b9202398f392",
    );
    expect(await answerCode("sha3-512 hello")).toBe(
      "sha3-512 75d527c368f2efe848ecf6b073a36767800805e9eef2b1857d5f984f036eb6df891d75f72d9b154518c1cd58835286d1da9a38deba3de98b5a53e5ed78a84976",
    );
  });

  it("treats a non-algo first token as part of the text", async () => {
    expect(await answerCode("sha999 abc")).toBe(
      "sha256 07fb106cdbeb4020545e7ebf427f58dbc12f79de40a7906ccdf802753598db84",
    );
  });

  it("preserves inner spacing of the text", async () => {
    expect(await answerCode("md5 hello  world")).toBe(
      "md5 fd27fbb9872ba413320c606fdfb98db1",
    );
  });

  it("falls back when an algorithm name has no text", async () => {
    const result = await hashCommand.run("md5", ctx);
    expect(result).toEqual({
      type: "fallback",
      slug: "hash",
      message: 'I don\'t understand "md5". Opening Hash…',
    });
  });

  it("is registered without aliases under the Utilities category", () => {
    expect(hashCommand.name).toBe("hash");
    expect(hashCommand.aliases).toEqual([]);
    expect(hashCommand.slug).toBe("hash");
    expect(hashCommand.status).toBe("live");
    expect(hashCommand.category).toBe("Utilities");
  });
});
