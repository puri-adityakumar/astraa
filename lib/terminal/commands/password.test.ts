import { describe, expect, it } from "vitest";
import { passwordCommand } from "./password";
import type { CommandContext, CommandResult } from "../types";

const ctx: CommandContext = { theme: "auto", commands: [passwordCommand] };

const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

function expectSecret(result: CommandResult): string {
  if (result.type !== "answer") {
    throw new Error(`Expected an answer, got ${result.type}`);
  }
  const block = result.output[0];
  if (!block || block.type !== "secret") {
    throw new Error(`Expected a secret block, got ${block?.type ?? "nothing"}`);
  }
  return block.secret;
}

async function expectFallback(args: string): Promise<string> {
  const result = await passwordCommand.run(args, ctx);
  if (result.type !== "fallback") {
    throw new Error(`Expected a fallback for "${args}", got ${result.type}`);
  }
  expect(result.slug).toBe("password");
  return result.message;
}

describe("password command", () => {
  it("answers a bare call with a 16-character secret plus the syntax hint", async () => {
    const result = await passwordCommand.run("", ctx);
    if (result.type !== "answer") {
      throw new Error(`Expected an answer, got ${result.type}`);
    }
    expect(result.output).toHaveLength(2);
    const secret = expectSecret(result);
    expect(secret).toHaveLength(16);
    expect(result.output[1]).toEqual({
      type: "text",
      text: "Use /password <8-128> or open the generator",
    });
  });

  it("treats whitespace-only args as a bare call", async () => {
    const result = await passwordCommand.run("   ", ctx);
    const secret = expectSecret(result);
    expect(secret).toHaveLength(16);
  });

  it("generates every character type", async () => {
    for (let i = 0; i < 3; i++) {
      const secret = expectSecret(await passwordCommand.run("", ctx));
      expect(secret).toMatch(/[A-Z]/);
      expect(secret).toMatch(/[a-z]/);
      expect(secret).toMatch(/[0-9]/);
      expect(secret.split("").some((ch) => SYMBOLS.includes(ch))).toBe(true);
    }
  });

  it("honours an explicit length", async () => {
    const secret = expectSecret(await passwordCommand.run("24", ctx));
    expect(secret).toHaveLength(24);
  });

  it("answers the explicit length without the hint", async () => {
    const result = await passwordCommand.run("24", ctx);
    if (result.type !== "answer") throw new Error("expected answer");
    expect(result.output).toHaveLength(1);
  });

  it("accepts the boundary lengths 8 and 128", async () => {
    expectSecret(await passwordCommand.run("8", ctx));
    const max = expectSecret(await passwordCommand.run("128", ctx));
    expect(max).toHaveLength(128);
  });

  it("falls back below the lower bound", async () => {
    expect(await expectFallback("7")).toBe('I don\'t understand "7". Opening Password…');
  });

  it("falls back above the upper bound", async () => {
    expect(await expectFallback("129")).toBe('I don\'t understand "129". Opening Password…');
    expect(await expectFallback("999")).toBe('I don\'t understand "999". Opening Password…');
  });

  it("falls back on non-numeric lengths", async () => {
    expect(await expectFallback("abc")).toBe('I don\'t understand "abc". Opening Password…');
  });

  it("falls back on non-integer lengths", async () => {
    expect(await expectFallback("24.5")).toBe('I don\'t understand "24.5". Opening Password…');
  });

  it("is registered with the /pw and /pass aliases", () => {
    expect(passwordCommand.name).toBe("password");
    expect(passwordCommand.aliases).toEqual(["pw", "pass"]);
    expect(passwordCommand.slug).toBe("password");
    expect(passwordCommand.status).toBe("live");
    expect(passwordCommand.category).toBe("Utilities");
  });
});
