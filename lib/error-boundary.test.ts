import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import ErrorBoundary from "@/app/error";
import GlobalError from "@/app/global-error";

describe("error boundary public rendering", () => {
  it("does not render a raw route error", () => {
    const secret = "admin@example.com https://example.com/private?token=secret /home/user/file.ts";
    const error = Object.assign(new Error(secret), { digest: "digest_123" });

    const html = renderToStaticMarkup(createElement(ErrorBoundary, { error, reset: vi.fn() }));

    expect(html).toContain("Something Went Wrong");
    expect(html).toContain("An unexpected error occurred");
    expect(html).not.toContain("admin@example.com");
    expect(html).not.toContain("example.com");
    expect(html).not.toContain("/home/user/file.ts");
  });

  it("keeps the global fallback generic while exposing only a safe digest", () => {
    const error = Object.assign(new Error("private@example.com"), {
      digest: "digest_456",
    });

    const html = renderToStaticMarkup(createElement(GlobalError, { error, reset: vi.fn() }));

    expect(html).toContain("UNEXPECTED_ERROR");
    expect(html).toContain("digest_456");
    expect(html).not.toContain("private@example.com");
  });
});
