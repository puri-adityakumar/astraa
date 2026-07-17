import { describe, it, expect, beforeEach } from "vitest";
import { createParseClient, createAbortError } from "./parse-client";

class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  delayMs = 0;
  postMessage(data: { id: number; text: string }) {
    setTimeout(() => {
      let value: unknown = null;
      try {
        value = JSON.parse(data.text);
      } catch {
        value = null;
      }
      this.onmessage?.({
        data: { id: data.id, value, diagnostics: [], bytes: data.text.length, parseMs: 1 },
      } as MessageEvent);
    }, this.delayMs);
  }
  terminate() {}
}

/** A worker that never responds, simulating an in-flight parse at destroy() time. */
class UnresponsiveWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  postMessage() {}
  terminate() {}
}

describe("createParseClient", () => {
  let worker: MockWorker;

  beforeEach(() => {
    worker = new MockWorker();
  });

  it("parses simple JSON", async () => {
    const client = createParseClient(worker as unknown as Worker);
    const result = await client.parse('{"a":1}');
    expect(result.value).toEqual({ a: 1 });
  });

  it("returns latest result only when multiple requests are queued", async () => {
    worker.delayMs = 20;
    const client = createParseClient(worker as unknown as Worker);
    const p1 = client.parse('{"a":1}');
    const p2 = client.parse('{"a":2}');
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r2.value).toEqual({ a: 2 });
    expect(r1.value).toBeNull();
  });

  it("rejects pending parses with an AbortError when destroyed", async () => {
    const client = createParseClient(new UnresponsiveWorker() as unknown as Worker);
    const promise = client.parse('{"a":1}');
    client.destroy();
    await expect(promise).rejects.toThrow(/ParseClient destroyed/);
  });

  it("rejects every pending parse when destroyed", async () => {
    const client = createParseClient(new UnresponsiveWorker() as unknown as Worker);
    const p1 = client.parse('{"a":1}');
    const p2 = client.parse('{"a":2}');
    client.destroy();
    await expect(p1).rejects.toThrow(/ParseClient destroyed/);
    await expect(p2).rejects.toThrow(/ParseClient destroyed/);
  });

  it("createAbortError produces an AbortError", () => {
    const err = createAbortError("boom");
    expect(err.name).toBe("AbortError");
    expect(err.message).toBe("boom");
  });

  it("resolves with a size diagnostic instead of posting oversized input", async () => {
    const worker = new UnresponsiveWorker();
    const client = createParseClient(worker as unknown as Worker);
    // 60 MB of payload — over the 50 MB parse-ingress cap. The unresponsive
    // worker would never answer, so a resolve here proves the cap short-circuits.
    const oversized = "x".repeat(60 * 1024 * 1024);
    const result = await client.parse(oversized);
    expect(result.value).toBeNull();
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]?.severity).toBe("error");
    expect(result.diagnostics[0]?.message).toMatch(/exceeds the 50 MB limit/);
  });
});
