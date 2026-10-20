import { describe, it, expect, vi } from "vitest";
import { getUserFriendlyError, logError, sanitizeErrorMessage } from "./error-handler";

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
  it.each(["TimeoutError", "AbortError"])("handles %s by name", (name) => {
    const error = new Error("The operation was interrupted");
    error.name = name;
    expect(getUserFriendlyError(error).title).toBe("Request Timeout");
  });
  it.each(["Load failed", "NetworkError when attempting to fetch resource"])(
    "handles browser network failure: %s",
    (message) => {
      expect(getUserFriendlyError(new TypeError(message)).title).toBe("Connection Error");
    },
  );
  it("prioritizes an abort over fetch text", () => {
    const error = new Error("The fetch was aborted");
    error.name = "AbortError";
    expect(getUserFriendlyError(error).title).toBe("Request Timeout");
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
  it.each([
    new TypeError("Failed to fetch"),
    new Error("Request timeout"),
    new Error("Permission denied"),
    new Error("Invalid input"),
    new Error("File unavailable"),
    new Error("Something broke"),
    "Unknown error",
  ])("sanitizes technical details in every error category: %s", (error) => {
    const privateDetails =
      " at /home/admin/secret for admin+private@company.com via " +
      "https://api.secret.com/key?token=private&user=admin#fragment";
    const input = error instanceof Error
      ? new (error.name === "TypeError" ? TypeError : Error)(error.message + privateDetails)
      : error + privateDetails;
    const result = getUserFriendlyError(input);
    expect(result.technical).toBe(
      `${error instanceof Error ? error.message : error} at [path] for [email] via [url]`,
    );
  });
  it("logs sanitized technical details", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      logError(new Error("Failed at https://api.secret.com/key?token=private"));
      expect(consoleError).toHaveBeenCalledWith(
        "Error occurred:",
        expect.objectContaining({ technical: "Failed at [url]" }),
      );
    } finally {
      consoleError.mockRestore();
    }
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
    const result = sanitizeErrorMessage("Failed to fetch https://api.secret.com/key");
    expect(result).toBe("Failed to fetch [url]");
  });
  it("redacts complete URLs including queries and fragments", () => {
    const result = sanitizeErrorMessage(
      "Failed at https://api.secret.com/key?token=secret&user=admin#private then retried",
    );
    expect(result).toBe("Failed at [url] then retried");
  });
  it("preserves text following paths", () => {
    expect(sanitizeErrorMessage("File /home/admin/secret.txt could not be read")).toBe(
      "File [path] could not be read",
    );
    expect(sanitizeErrorMessage("File C:\\Users\\admin\\secret.txt could not be read")).toBe(
      "File [path] could not be read",
    );
  });
  it("removes email addresses", () => {
    const result = sanitizeErrorMessage("Contact admin@company.com for help");
    expect(result).toContain("[email]");
    expect(result).not.toContain("admin@company.com");
  });
  it("removes email addresses with plus tags", () => {
    expect(sanitizeErrorMessage("Contact admin+private@company.com for help")).toBe(
      "Contact [email] for help",
    );
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
