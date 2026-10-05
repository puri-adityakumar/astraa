import { describe, expect, it } from "vitest";
import { base64Command } from "./base64";
import type { CommandContext } from "../types";

const ctx: CommandContext = { theme: "auto", commands: [base64Command] };

async function answerCode(args: string): Promise<string> {
  const result = await base64Command.run(args, ctx);
  if (result.type !== "answer") {
    throw new Error(`Expected an answer for "${args}", got ${result.type}`);
  }
  return result.output
    .map((block) => (block.type === "code" ? block.code : ""))
    .join("\n");
}

describe("base64 command", () => {
  it("opens the panel when called without args", async () => {
    expect(await base64Command.run("", ctx)).toEqual({
      type: "open",
      slug: "base64",
    });
  });

  it("opens the panel for whitespace-only args", async () => {
    expect(await base64Command.run("   ", ctx)).toEqual({
      type: "open",
      slug: "base64",
    });
  });

  it("encodes the whole args by default", async () => {
    expect(await answerCode("hello")).toBe("aGVsbG8=");
  });

  it("encodes after an explicit encode keyword", async () => {
    expect(await answerCode("encode hello")).toBe("aGVsbG8=");
  });

  it("encodes non-ASCII text as UTF-8 bytes", async () => {
    expect(await answerCode("héllo")).toBe("aMOpbGxv");
  });

  it("encodes inner spacing verbatim after the keyword", async () => {
    expect(await answerCode("encode a  b")).toBe(
      await answerCode("a  b"),
    );
  });

  it("decodes valid base64 with the decode keyword", async () => {
    expect(await answerCode("decode aGVsbG8=")).toBe("hello");
  });

  it("decodes valid base64 with the -d keyword", async () => {
    expect(await answerCode("-d aGVsbG8=")).toBe("hello");
  });

  it("round-trips UTF-8 text through decode", async () => {
    expect(await answerCode("decode aMOpbGxv")).toBe("héllo");
  });

  it("accepts the decode keyword in any case", async () => {
    expect(await answerCode("Decode aGVsbG8=")).toBe("hello");
    expect(await answerCode("DECODE aGVsbG8=")).toBe("hello");
  });

  it("accepts the -d keyword in any case", async () => {
    expect(await answerCode("-D aGVsbG8=")).toBe("hello");
  });

  it("accepts the encode keyword in any case", async () => {
    expect(await answerCode("ENCODE hello")).toBe("aGVsbG8=");
  });

  it("keeps the payload case-sensitive after a keyword", async () => {
    expect(await answerCode("encode HeLLo")).toBe("SGVMTG8=");
  });

  it("treats a lone keyword token as the keyword in any case", async () => {
    const result = await base64Command.run("dEcOdE", ctx);
    expect(result.type).toBe("fallback");
  });

  it("falls back on invalid base64 characters when decoding", async () => {
    expect(await base64Command.run("decode a!!!", ctx)).toEqual({
      type: "fallback",
      slug: "base64",
      message: 'I don\'t understand "decode a!!!". Opening Base64…',
    });
  });

  it("falls back on bad padding when decoding", async () => {
    const result = await base64Command.run("decode aGVsbG", ctx);
    expect(result.type).toBe("fallback");
  });

  it("falls back when the encode keyword has no payload", async () => {
    const result = await base64Command.run("encode", ctx);
    expect(result.type).toBe("fallback");
  });

  it("falls back when the decode keyword has no payload", async () => {
    const result = await base64Command.run("decode", ctx);
    expect(result.type).toBe("fallback");
  });

  it("is registered under its /b64 alias", () => {
    expect(base64Command.name).toBe("base64");
    expect(base64Command.aliases).toEqual(["b64"]);
    expect(base64Command.slug).toBe("base64");
    expect(base64Command.status).toBe("live");
    expect(base64Command.category).toBe("Developer Tools");
  });
});
