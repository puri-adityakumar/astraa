import { describe, expect, it } from "vitest";
import {
  SENSITIVE_REPLAY_ROUTES,
  isSensitiveReplayRoute,
} from "./sensitive-replay-routes";

describe("sensitive-replay-routes", () => {
  it("covers exactly the secret-handling tool routes from issue #96", () => {
    expect([...SENSITIVE_REPLAY_ROUTES]).toEqual([
      "/tools/password",
      "/tools/hash",
      "/tools/text",
    ]);
  });

  it.each(SENSITIVE_REPLAY_ROUTES)("marks %s as sensitive", (route) => {
    expect(isSensitiveReplayRoute(route)).toBe(true);
  });

  it.each(SENSITIVE_REPLAY_ROUTES)(
    "tolerates trailing slashes on %s",
    (route) => {
      expect(isSensitiveReplayRoute(`${route}/`)).toBe(true);
      expect(isSensitiveReplayRoute(`${route}//`)).toBe(true);
    },
  );

  it("does not match longer slugs that merely start with a sensitive slug", () => {
    expect(isSensitiveReplayRoute("/tools/passwordx")).toBe(false);
    expect(isSensitiveReplayRoute("/tools/hashcat")).toBe(false);
    expect(isSensitiveReplayRoute("/tools/text-to-image")).toBe(false);
  });

  it("does not mark other tools or site pages as sensitive", () => {
    expect(isSensitiveReplayRoute("/")).toBe(false);
    expect(isSensitiveReplayRoute("/tools")).toBe(false);
    expect(isSensitiveReplayRoute("/tools/currency")).toBe(false);
    expect(isSensitiveReplayRoute("/privacy")).toBe(false);
    expect(isSensitiveReplayRoute("/terminal/tools/password")).toBe(false);
  });

  it("is case-sensitive like URL paths", () => {
    expect(isSensitiveReplayRoute("/tools/Password")).toBe(false);
  });

  it("treats an empty-ish path as the home page, not a tool", () => {
    expect(isSensitiveReplayRoute("")).toBe(false);
    expect(isSensitiveReplayRoute("/")).toBe(false);
  });
});
