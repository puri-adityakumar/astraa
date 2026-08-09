import { describe, expect, it } from "vitest";

import { globalStructuredData, serializeJsonLd } from "./structured-data";
import { SITE_URL } from "./site";

describe("global structured data", () => {
  it("contains only stable Organization and WebSite nodes", () => {
    const serialized = serializeJsonLd(globalStructuredData);
    const parsed = JSON.parse(serialized) as typeof globalStructuredData;
    const types = parsed["@graph"].map((node) => node["@type"]);
    const ids = parsed["@graph"].map((node) => node["@id"]);

    expect(types).toEqual(["Organization", "WebSite"]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => id.startsWith(`${SITE_URL}/#`))).toBe(true);
    expect(serialized).not.toContain("SearchAction");
    expect(serialized).not.toContain("dateModified");
    expect(serialized).not.toContain("potentialAction");
  });

  it("escapes markup-significant less-than characters", () => {
    const serialized = serializeJsonLd({ value: "</script><script>alert(1)</script>" });

    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual({ value: "</script><script>alert(1)</script>" });
  });
});
