import { describe, expect, it } from "vitest";

import { encodeText } from "@/lib/base64";
import { evaluateExpression } from "@/lib/calculator/calculator-utils";
import { generateHash } from "@/lib/hash";
import { calculateDimensions } from "@/lib/image/image-utils";
import { repair } from "@/lib/json/repair";
import { createSqlFormatter } from "@/lib/sql/formatter";
import { DEFAULT_SQL_OPTIONS } from "@/lib/sql/types";
import { validateTextGenerationRequest } from "@/lib/text-generation";
import { availableTools } from "@/lib/tools";
import { convertTemperature, unitCategories } from "@/lib/unit-conversions";

import { GUIDED_TOOL_IDS, TOOL_GUIDES } from "./tool-guides";

const formatSqlForGuideTest = createSqlFormatter(() => import("sql-formatter"));

describe("server-rendered tool guides", () => {
  it("covers every available tool with unique content", () => {
    expect([...GUIDED_TOOL_IDS].sort()).toEqual(availableTools.map((tool) => tool.id).sort());
    expect(new Set(GUIDED_TOOL_IDS).size).toBe(GUIDED_TOOL_IDS.length);
    expect(new Set(Object.values(TOOL_GUIDES).map((guide) => guide.heading)).size).toBe(
      GUIDED_TOOL_IDS.length,
    );
    expect(new Set(Object.values(TOOL_GUIDES).map((guide) => guide.summary)).size).toBe(
      GUIDED_TOOL_IDS.length,
    );

    for (const toolId of GUIDED_TOOL_IDS) {
      const guide = TOOL_GUIDES[toolId];
      expect(availableTools.some((tool) => tool.id === toolId)).toBe(true);
      expect(guide.steps).toHaveLength(3);
      expect(guide.capabilities.length).toBeGreaterThanOrEqual(3);
      expect(guide.limitations.length).toBeGreaterThanOrEqual(2);
      expect(guide.processing.length).toBeGreaterThan(60);
    }
  });

  it("keeps deterministic examples aligned with tool output", () => {
    expect(encodeText(TOOL_GUIDES.base64.example.input, { urlSafe: false, wrap76: false })).toBe(
      TOOL_GUIDES.base64.example.output,
    );

    expect(generateHash(TOOL_GUIDES.hash.example.input, "sha256")).toBe(
      TOOL_GUIDES.hash.example.output,
    );

    expect(JSON.stringify(JSON.parse(TOOL_GUIDES.json.example.input), null, 2)).toBe(
      TOOL_GUIDES.json.example.output,
    );

    const regexResult = /\b[A-Z][a-z]+\b/.exec("Astraa ships tools.");
    expect(regexResult?.[0]).toBe(TOOL_GUIDES.regex.example.output);

    expect(calculateDimensions(800, { width: 1600, height: 900 }, true)).toEqual({
      width: 800,
      height: 450,
    });
    expect(TOOL_GUIDES.image.example.output).toContain("800 × 450");

    expect(evaluateExpression(TOOL_GUIDES.calculator.example.input)).toBe(
      Number(TOOL_GUIDES.calculator.example.output),
    );

    expect(convertTemperature(100, "°C", "°F")).toBe(212);
    expect(TOOL_GUIDES.units.example.output).toBe("212 °F");
    expect(TOOL_GUIDES.units.capabilities.join(" ")).toContain(
      `${unitCategories.length} categories`,
    );

    expect(validateTextGenerationRequest("seed-starting basics", 120)).toEqual({
      ok: true,
      topic: "seed-starting basics",
      wordCount: 120,
    });
    expect(TOOL_GUIDES.text.example.input).toContain("120 words");
  });

  it("keeps JSON repair copy aligned with its best-effort behavior", async () => {
    const guideCopy = JSON.stringify(TOOL_GUIDES.json);
    const unrecoverable = await repair("{{{{{");

    expect(guideCopy).not.toMatch(/repair.{0,80}5 MB|5 MB.{0,80}repair/i);
    expect(unrecoverable.ok).toBe(false);
    expect(TOOL_GUIDES.json.capabilities).toContain("Local .json file input up to 50 MB");
    expect(TOOL_GUIDES.json.limitations.join(" ")).toContain(
      "cannot recover every malformed document",
    );
  });

  it("keeps the SQL example aligned with the reviewed formatter options", async () => {
    const result = await formatSqlForGuideTest(TOOL_GUIDES.sql.example.input, DEFAULT_SQL_OPTIONS);

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.output).toBe(TOOL_GUIDES.sql.example.output);
    expect(TOOL_GUIDES.sql.limitations.join(" ")).toContain("layout and configured keyword case");
    expect(TOOL_GUIDES.sql.limitations.join(" ")).not.toMatch(/whitespace only/i);
  });

  it("limits image quality claims to JPEG and WebP output", () => {
    const guideCopy = JSON.stringify(TOOL_GUIDES.image);

    expect(guideCopy).not.toMatch(/JPEG, PNG, or WebP (?:with|plus) quality/i);
    expect(TOOL_GUIDES.image.summary).toContain("quality for JPEG or WebP");
    expect(TOOL_GUIDES.image.steps[2]).toContain("quality for JPEG or WebP");
    expect(TOOL_GUIDES.image.limitations.join(" ")).toContain(
      "PNG export ignores the JPEG/WebP quality setting",
    );
  });
});
