import { describe, expect, it } from "vitest";

import {
  sanitizeDiagnosticContext,
  sanitizeDiagnosticMessage,
  sanitizeSentryBreadcrumb,
  sanitizeSentryEvent,
  stripUrlDetails,
} from "./sanitize";

describe("diagnostic sanitization", () => {
  it("redacts URLs before path handling, including query and hash", () => {
    const secret = "https://api.example.com/private/file?token=secret-value#account";
    const result = sanitizeDiagnosticMessage(`Request failed at ${secret}`);

    expect(result).toContain("[url]");
    expect(result).not.toContain("example.com");
    expect(result).not.toContain("secret-value");
  });

  it("redacts Windows and Unix absolute paths", () => {
    const result = sanitizeDiagnosticMessage(
      "C:\\Users\\aditya\\secret.txt and /home/aditya/private/file.ts failed",
    );

    expect(result).not.toContain("aditya");
    expect(result).not.toContain("secret.txt");
    expect(result).toContain("[path]");
  });

  it("redacts email, IP, authorization, cookies, and obvious credentials", () => {
    const result = sanitizeDiagnosticMessage(
      "admin@example.com 192.168.1.20 Authorization: Bearer abc.def.ghi\n" +
        "Cookie: session=private\napi_key=secret123 CG-ABCDEF123456",
    );

    for (const sensitive of [
      "admin@example.com",
      "192.168.1.20",
      "abc.def.ghi",
      "session=private",
      "secret123",
      "CG-ABCDEF123456",
    ]) {
      expect(result).not.toContain(sensitive);
    }
  });

  it("caps long free-form messages", () => {
    const result = sanitizeDiagnosticMessage("long diagnostic phrase ".repeat(30));
    expect(result.length).toBeLessThan(270);
    expect(result).toContain("[truncated]");
  });

  it("keeps only allowlisted context through bounded nesting", () => {
    const result = sanitizeDiagnosticContext({
      operation: "regex.export",
      topic: "private prompt",
      routeTemplate: "/tools/regex?test=private",
      details: {
        errorCode: "EXPORT_FAILED",
        password: "secret",
        details: { details: { operation: "too-deep" } },
      },
    });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      operation: "regex.export",
      routeTemplate: "/tools/regex",
      details: { errorCode: "EXPORT_FAILED" },
    });
    expect(serialized).not.toContain("private prompt");
    expect(serialized).not.toContain("secret");
    expect(serialized).not.toContain("too-deep");
  });
});

describe("Sentry event sanitization", () => {
  it("removes named user content while preserving operational fields", () => {
    const event = {
      message: "Failed for admin@example.com at /home/aditya/private.ts",
      request: {
        url: "https://astraa.tech/tools/text?topic=private#output",
        headers: {
          authorization: "Bearer top-secret",
          cookie: "session=private",
          accept: "application/json",
        },
        body: "private body",
      },
      user: { id: "192.168.1.10", email: "admin@example.com" },
      contexts: {
        astraa: {
          errorCode: "UPSTREAM_TIMEOUT",
          routeTemplate: "/tools/text",
          durationMs: 120,
          topic: "private AI topic",
          clipboard: "copied secret",
          rateLimitIdentity: "hashed-private-identity",
        },
      },
      exception: {
        values: [
          {
            type: "Error",
            value: "secret@example.com C:\\Users\\name\\file.ts",
            stacktrace: {
              frames: [{ filename: "https://astraa.tech/_next/app.js?token=secret" }],
            },
          },
        ],
      },
    };

    const sanitized = sanitizeSentryEvent(event);
    const serialized = JSON.stringify(sanitized);

    for (const sensitive of [
      "admin@example.com",
      "private body",
      "top-secret",
      "session=private",
      "private AI topic",
      "copied secret",
      "hashed-private-identity",
      "token=secret",
      "C:\\Users\\name",
    ]) {
      expect(serialized).not.toContain(sensitive);
    }
    expect(sanitized).toMatchObject({
      contexts: {
        astraa: {
          errorCode: "UPSTREAM_TIMEOUT",
          routeTemplate: "/tools/text",
          durationMs: 120,
        },
      },
    });
  });

  it("drops input breadcrumbs and strips URL details elsewhere", () => {
    expect(sanitizeSentryBreadcrumb({ category: "ui.input", message: "secret" })).toBeNull();
    expect(stripUrlDetails("https://astraa.tech/tools/text?topic=secret#result")).toBe(
      "https://astraa.tech/tools/text",
    );
  });
});
