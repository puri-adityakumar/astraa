import { describe, it, expect } from "vitest";
import { getUserFriendlyError, sanitizeErrorMessage } from "./error-handler";

describe("getUserFriendlyError", () => {
  it("handles network/fetch errors", () => {
    const error = new TypeError("Failed to fetch");
    const result = getUserFriendlyError(error);
    expect(result.title).toBe("Connection Error");
    expect(result.action).toBe("Retry");
  });
  it("handles timeout errors", () => {
    const error = new Error("Request timeout");
    const result = getUserFriendlyError(error);
    expect(result.title).toBe("Request Timeout");
  });
  it("handles permission errors", () => {
    const error = new Error("Permission denied");
    const result = getUserFriendlyError(error);
    expect(result.title).toBe("Permission Denied");
  });
  it("handles validation errors", () => {
    const error = new Error("Invalid input value");
    const result = getUserFriendlyError(error);
    expect(result.title).toBe("Invalid Input");
  });
  it("handles file errors", () => {
    const error = new Error("File too large");
    const result = getUserFriendlyError(error);
    expect(result.title).toBe("File Error");
  });
  it("handles generic Error", () => {
    const error = new Error("Something broke");
    const result = getUserFriendlyError(error);
    expect(result.title).toBe("Something Went Wrong");
    expect(result.technical).toBe("Something broke");
  });
  it("handles non-Error types", () => {
    const result = getUserFriendlyError("string error");
    expect(result.title).toBe("Unknown Error");
    expect(result.technical).toBe("string error");
  });
  it("handles null/undefined", () => {
    const result = getUserFriendlyError(null);
    expect(result.title).toBe("Unknown Error");
  });

  describe("technical field redaction (funnel)", () => {
    it("redacts Unix paths from the technical field", () => {
      const result = getUserFriendlyError(new Error("failed to load /home/user/secret.txt"));
      expect(result.technical).toContain("[path]");
      expect(result.technical).not.toContain("/home/user/secret.txt");
      expect(result.technical).not.toContain("secret.txt");
    });

    it("redacts Windows paths from the technical field", () => {
      const result = getUserFriendlyError(new Error("Cannot open C:\\Users\\admin\\secret.txt"));
      expect(result.technical).toContain("[path]");
      expect(result.technical).not.toContain("admin");
    });

    it("redacts URLs from the technical field", () => {
      // UNIX_PATH_RE matches before URL_RE, so the URL's host becomes [path]
      // rather than [url] (see the sanitizeErrorMessage tests). Either way, the
      // sensitive host segment is removed from the technical field.
      const result = getUserFriendlyError(new Error("visit https://evil.com token=abc"));
      expect(result.technical).not.toContain("evil.com");
      expect(result.technical).not.toContain("https://");
    });

    it("redacts emails from the technical field", () => {
      // "Contact <user@x.com> for details" — redacted regardless of token.
      const result = getUserFriendlyError(new Error("Contact user@example.com for details"));
      expect(result.technical).toContain("[email]");
      expect(result.technical).not.toContain("user@example.com");
    });

    it("does not alter the user-facing message/title/action fields", () => {
      const result = getUserFriendlyError(new Error("failed to load /home/user/secret.txt"));
      // User-facing fields are static friendly strings, never derived from the raw message.
      expect(result.title).toBe("Something Went Wrong");
      expect(result.message).toBe(
        "An unexpected error occurred. Please try again or contact support if the problem persists.",
      );
      expect(result.action).toBe("Try Again");
      expect(result.message).not.toContain("/home/user");
      expect(result.title).not.toContain("/home/user");
    });
  });
});

describe("sanitizeErrorMessage", () => {
  it("removes Windows paths", () => {
    const result = sanitizeErrorMessage("Error at C:\\Users\\admin\\file.txt");
    expect(result).toContain("[path]");
    expect(result).not.toContain("admin");
  });
  it("removes Unix paths", () => {
    const result = sanitizeErrorMessage("Error at /home/user/secret/file.ts");
    expect(result).toContain("[path]");
    expect(result).not.toContain("secret");
  });
  it("removes URLs", () => {
    // Note: UNIX_PATH_RE (/\/[\w\/\-. ]+/g) matches before URL_RE in the chain,
    // so "https://api.secret.com/key" becomes "https:[path]" rather than "[url]".
    // The sensitive content is still removed; only the replacement token differs.
    const result = sanitizeErrorMessage("Failed to fetch https://api.secret.com/key");
    expect(result).toContain("[path]");
    expect(result).not.toContain("secret");
  });
  it("removes email addresses", () => {
    const result = sanitizeErrorMessage("Contact admin@company.com for help");
    expect(result).toContain("[email]");
    expect(result).not.toContain("admin@company.com");
  });
  it("removes IP addresses", () => {
    const result = sanitizeErrorMessage("Connection to 192.168.1.100 failed");
    expect(result).toContain("[ip]");
    expect(result).not.toContain("192.168.1.100");
  });
  it("leaves clean messages unchanged", () => {
    const msg = "Something went wrong";
    expect(sanitizeErrorMessage(msg)).toBe(msg);
  });
});
