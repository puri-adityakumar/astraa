import { describe, it, expect } from "vitest";
import { joinPath, parsePath, formatPath } from "./paths";

describe("joinPath", () => {
  it("joins string keys with dots", () => {
    expect(joinPath("data", "users")).toBe("data.users");
  });

  it("appends array index with bracket", () => {
    expect(joinPath("users", 0)).toBe("users[0]");
  });

  it("starts from empty parent", () => {
    expect(joinPath("", "a")).toBe("a");
  });

  it("handles keys with dots or brackets by quoting", () => {
    expect(joinPath("a", "b.c")).toBe('a["b.c"]');
  });
});

describe("parsePath", () => {
  it("parses dot-separated path", () => {
    expect(parsePath("data.users")).toEqual(["data", "users"]);
  });

  it("parses bracketed index", () => {
    expect(parsePath("users[0].name")).toEqual(["users", 0, "name"]);
  });

  it("parses quoted bracket key", () => {
    expect(parsePath('a["b.c"]')).toEqual(["a", "b.c"]);
  });
});

describe("formatPath", () => {
  it("formats top-level as empty string", () => {
    expect(formatPath([])).toBe("");
  });

  it("formats nested object path", () => {
    expect(formatPath(["data", "users", 0, "name"])).toBe("data.users[0].name");
  });
});
