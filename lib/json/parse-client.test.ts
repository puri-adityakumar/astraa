import { describe, it, expect, beforeEach } from "vitest";
import { createParseClient } from "./parse-client";

class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  delayMs = 0;
  dead = false;
  terminateThrows = false;
  postMessage(data: { id: number; text: string }) {
    if (this.dead) return;
    setTimeout(() => {
      if (this.dead) return;
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
  terminate() {
    this.dead = true;
    if (this.terminateThrows) throw new Error("terminate failed");
  }
}

describe("createParseClient", () => {
  let worker: MockWorker;

  beforeEach(() => {
    worker = new MockWorker();
  });

  it("parses simple JSON", async () => {
    const client = createParseClient(worker as unknown as Worker);
    const result = await client.parse('{"a":1}');
    expect(result?.value).toEqual({ a: 1 });
  });

  it("returns latest result only when multiple requests are queued", async () => {
    worker.delayMs = 20;
    const client = createParseClient(worker as unknown as Worker);
    const p1 = client.parse('{"a":1}');
    const p2 = client.parse('{"a":2}');
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r2?.value).toEqual({ a: 2 });
    expect(r1).toBeNull();
  });

  it("settles pending and future requests when destroyed", async () => {
    worker.delayMs = 20;
    const client = createParseClient(worker as unknown as Worker);
    const pending = client.parse("{\"a\":1}");
    client.destroy();
    await expect(pending).resolves.toBeNull();
    await expect(client.parse("{}")).resolves.toBeNull();
  });

  it("settles stale requests without waiting for their worker replies", async () => {
    worker.delayMs = 20;
    const client = createParseClient(worker as unknown as Worker);
    const stale = client.parse("{\"a\":1}");
    const latest = client.parse("{\"a\":2}");
    await expect(stale).resolves.toBeNull();
    client.destroy();
    await expect(latest).resolves.toBeNull();
  });

  it("rejects pending requests when the worker fails", async () => {
    const client = createParseClient(worker as unknown as Worker);
    const pending = client.parse("{}");
    worker.onerror?.();
    await expect(pending).rejects.toThrow("JSON parser worker failed");
    client.destroy();
  });

  it("rejects requests issued after the worker fails", async () => {
    const client = createParseClient(worker as unknown as Worker);
    worker.onerror?.();
    await expect(client.parse("{}")).rejects.toThrow("JSON parser worker failed");
    await expect(client.parse('{"a":1}')).rejects.toThrow("JSON parser worker failed");
    client.destroy();
  });

  it("settles pending requests even when terminate throws", async () => {
    worker.delayMs = 20;
    worker.terminateThrows = true;
    const client = createParseClient(worker as unknown as Worker);
    const pending = client.parse("{\"a\":1}");
    expect(() => client.destroy()).not.toThrow();
    await expect(pending).resolves.toBeNull();
    expect(() => client.destroy()).not.toThrow();
  });
});
