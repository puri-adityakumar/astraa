import { describe, expect, it } from "vitest";
import { unitsCommand } from "./units";
import type { CommandContext } from "../types";

const ctx: CommandContext = { theme: "auto", commands: [unitsCommand] };

async function answerText(args: string): Promise<string> {
  const result = await unitsCommand.run(args, ctx);
  if (result.type !== "answer") {
    throw new Error(`Expected an answer for "${args}", got ${result.type}`);
  }
  return result.output
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n");
}

describe("units command", () => {
  it("opens the panel when called without args", async () => {
    expect(await unitsCommand.run("", ctx)).toEqual({ type: "open", slug: "units" });
  });

  it("opens the panel for whitespace-only args", async () => {
    expect(await unitsCommand.run("   ", ctx)).toEqual({ type: "open", slug: "units" });
  });

  it("answers a length conversion km to mi", async () => {
    expect(await answerText("10 km to mi")).toBe("10 km = 6.2137 mi");
  });

  it("answers a temperature conversion with the offset formula", async () => {
    expect(await answerText("100 c to f")).toBe("100 °C = 212 °F");
  });

  it("accepts the full temperature unit names case-insensitively", async () => {
    expect(await answerText("100 celsius to fahrenheit")).toBe("100 °C = 212 °F");
  });

  it("accepts the temperature symbols", async () => {
    expect(await answerText("100 °C to °F")).toBe("100 °C = 212 °F");
  });

  it("answers kelvin to celsius", async () => {
    expect(await answerText("0 k to c")).toBe("0 K = -273.15 °C");
  });

  it("answers a same-scale conversion exactly", async () => {
    expect(await answerText("1 km to m")).toBe("1 km = 1000 m");
  });

  it("matches unit tokens case-insensitively", async () => {
    expect(await answerText("5 KM to Mi")).toBe("5 km = 3.1069 mi");
  });

  it("accepts common plural names", async () => {
    expect(await answerText("10 kilometers to miles")).toBe("10 km = 6.2137 mi");
  });

  it("answers a mass conversion", async () => {
    expect(await answerText("2 lb to oz")).toBe("2 lb = 32 oz");
  });

  it("answers a same-unit request", async () => {
    expect(await answerText("3 km to km")).toBe("3 km = 3 km");
  });

  it("falls back on an unknown unit", async () => {
    expect(await unitsCommand.run("10 km to zorp", ctx)).toEqual({
      type: "fallback",
      slug: "units",
      message: 'I don\'t understand "10 km to zorp". Opening Units…',
    });
  });

  it("falls back on a cross-category pair", async () => {
    expect(await unitsCommand.run("10 kg to m", ctx)).toEqual({
      type: "fallback",
      slug: "units",
      message: 'I don\'t understand "10 kg to m". Opening Units…',
    });
  });

  it("falls back on a non-numeric amount", async () => {
    expect(await unitsCommand.run("ten km to mi", ctx)).toEqual({
      type: "fallback",
      slug: "units",
      message: 'I don\'t understand "ten km to mi". Opening Units…',
    });
  });

  it("falls back when the to keyword is missing", async () => {
    const result = await unitsCommand.run("10 km mi", ctx);
    expect(result.type).toBe("fallback");
  });

  it("falls back when the target unit is missing", async () => {
    const result = await unitsCommand.run("10 km to", ctx);
    expect(result.type).toBe("fallback");
  });

  it("falls back on extra tokens", async () => {
    const result = await unitsCommand.run("10 km to mi please", ctx);
    expect(result.type).toBe("fallback");
  });

  it("is registered under its /unit and /convert aliases", () => {
    expect(unitsCommand.name).toBe("units");
    expect(unitsCommand.aliases).toEqual(["unit", "convert"]);
    expect(unitsCommand.slug).toBe("units");
    expect(unitsCommand.status).toBe("live");
    expect(unitsCommand.category).toBe("Utilities");
  });
});
