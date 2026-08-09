import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AppError,
  createDiagnosticRecord,
  createSafeErrorReport,
  formatSafeErrorReport,
  getUserFriendlyError,
  logError,
  sanitizeErrorMessage,
} from "./error-handler";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getUserFriendlyError", () => {
  it("maps named domain errors to stable public copy", () => {
    expect(getUserFriendlyError(new AppError("CONNECTION_ERROR"))).toMatchObject({
      code: "CONNECTION_ERROR",
      title: "Connection Error",
      retryable: true,
    });
    expect(getUserFriendlyError({ code: "INVALID_PAIR" })).toMatchObject({
      code: "INVALID_INPUT",
      title: "Invalid Input",
    });
  });

  it("maps timeout names without matching message substrings", () => {
    expect(getUserFriendlyError(new DOMException("private details", "TimeoutError"))).toMatchObject(
      { code: "REQUEST_TIMEOUT", title: "Request Timeout" },
    );
  });

  it("returns generic safe copy for unexpected and unknown values", () => {
    const secret = "admin@example.com at /home/aditya/private.ts";
    const errorResult = getUserFriendlyError(new Error(secret));
    const unknownResult = getUserFriendlyError(secret);

    expect(errorResult.code).toBe("UNEXPECTED_ERROR");
    expect(unknownResult.code).toBe("UNEXPECTED_ERROR");
    expect(JSON.stringify([errorResult, unknownResult])).not.toContain(secret);
  });
});

describe("diagnostic records", () => {
  it("redacts error messages, stacks, and allowlisted context before logging", () => {
    const error = new Error(
      "admin@example.com failed at https://example.com/private?token=secret and " +
        "C:\\Users\\aditya\\secret.ts",
    );
    const diagnostic = createDiagnosticRecord(
      error,
      {
        operation: "text.generate",
        routeTemplate: "/tools/text?topic=private",
        topic: "private prompt",
        details: {
          errorCode: "UPSTREAM_UNAVAILABLE",
          authorization: "Bearer secret",
        },
      },
      new Date("2026-08-08T00:00:00.000Z"),
    );
    const serialized = JSON.stringify(diagnostic);

    for (const sensitive of [
      "admin@example.com",
      "example.com",
      "token=secret",
      "C:\\Users\\aditya",
      "private prompt",
      "Bearer secret",
      "topic=private",
    ]) {
      expect(serialized).not.toContain(sensitive);
    }
    expect(diagnostic).toMatchObject({
      code: "UNEXPECTED_ERROR",
      context: {
        operation: "text.generate",
        routeTemplate: "/tools/text",
        details: { errorCode: "UPSTREAM_UNAVAILABLE" },
      },
      timestamp: "2026-08-08T00:00:00.000Z",
    });
  });

  it("never sends raw values to console output", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const secret = "secret@example.com /home/user/private.txt";

    logError(new Error(secret), { operation: "boundary.capture", password: "hidden" });

    const logged = JSON.stringify(consoleSpy.mock.calls);
    expect(logged).not.toContain("secret@example.com");
    expect(logged).not.toContain("/home/user/private.txt");
    expect(logged).not.toContain("hidden");
  });

  it("creates copy-safe support details with only code, digest, route, and time", () => {
    const report = createSafeErrorReport(
      new Error("secret@example.com"),
      "digest_123",
      "/tools/text?topic=private",
      new Date("2026-08-08T00:00:00.000Z"),
    );

    expect(report).toEqual({
      code: "UNEXPECTED_ERROR",
      digest: "digest_123",
      routeTemplate: "/tools/text",
      timestamp: "2026-08-08T00:00:00.000Z",
    });
    expect(JSON.stringify(report)).not.toContain("secret@example.com");
    expect(formatSafeErrorReport(report)).toBe(
      "Code: UNEXPECTED_ERROR\n" +
        "Digest: digest_123\n" +
        "Route: /tools/text\n" +
        "Timestamp: 2026-08-08T00:00:00.000Z",
    );
  });
});

describe("sanitizeErrorMessage compatibility", () => {
  it("uses the shared ordered redaction pipeline", () => {
    const result = sanitizeErrorMessage(
      "https://api.example.com/private /home/user/file.ts 192.168.1.20",
    );
    expect(result).toContain("[url]");
    expect(result).toContain("[path]");
    expect(result).toContain("[ip]");
    expect(result).not.toContain("example.com");
  });
});
