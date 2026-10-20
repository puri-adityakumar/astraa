import { describe, expect, it } from "vitest";
import { markdownUrlTransform } from "./url-transform";

const img = { type: "element", tagName: "img", properties: {}, children: [] } as const;
const link = { type: "element", tagName: "a", properties: {}, children: [] } as const;

describe("markdownUrlTransform", () => {
  it.each(["png", "jpeg", "gif", "webp"])("allows dropped %s images", (type) => {
    const url = `data:image/${type};base64,YQ==`;
    expect(markdownUrlTransform(url, "src", { ...img, children: [] })).toBe(url);
  });

  it.each([
    "data:image/svg+xml;base64,PHN2Zz4=",
    "data:text/html;base64,PHNjcmlwdD4=",
    "data:image/png,raw-data",
    "javascript:alert(1)",
  ])("blocks unsafe image URL %j", (url) => {
    expect(markdownUrlTransform(url, "src", { ...img, children: [] })).toBe("");
  });

  it("never allows data URLs on links or non-image nodes", () => {
    const url = "data:image/png;base64,YQ==";
    expect(markdownUrlTransform(url, "href", { ...img, children: [] })).toBe("");
    expect(markdownUrlTransform(url, "src", { ...link, children: [] })).toBe("");
    expect(markdownUrlTransform(url, "href", { ...link, children: [] })).toBe("");
  });

  it.each(["https://example.com/a.png", "/images/a.png", "#heading", "mailto:a@example.com"])(
    "keeps the default handling for %j",
    (url) => {
      expect(markdownUrlTransform(url, "href", { ...link, children: [] })).toBe(url);
    },
  );
});
