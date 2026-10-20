import { describe, it, expect, beforeEach } from "vitest";
import { useJsonEditor, stripVolatile } from "./json-editor";
import { DEFAULT_STATE } from "@/lib/json/defaults";

describe("useJsonEditor", () => {
  beforeEach(() => {
    useJsonEditor.getState().reset();
  });

  it("hydrates with defaults", () => {
    const s = useJsonEditor.getState();
    expect(s.view).toBe(DEFAULT_STATE.view);
    expect(s.text).toBe(DEFAULT_STATE.text);
  });

  it("setText updates text", () => {
    useJsonEditor.getState().setText('{"x":1}');
    expect(useJsonEditor.getState().text).toBe('{"x":1}');
  });

  it("setView updates view", () => {
    useJsonEditor.getState().setView("tree");
    expect(useJsonEditor.getState().view).toBe("tree");
  });

  it("togglePath adds and removes from expanded set", () => {
    useJsonEditor.getState().togglePath("data");
    expect(useJsonEditor.getState().expanded).toContain("data");
    useJsonEditor.getState().togglePath("data");
    expect(useJsonEditor.getState().expanded).not.toContain("data");
  });

  it("reset returns to defaults", () => {
    useJsonEditor.getState().setText("changed");
    useJsonEditor.getState().reset();
    expect(useJsonEditor.getState().text).toBe(DEFAULT_STATE.text);
  });

  it.each(["format", "minify", "sortKeysAction"] as const)(
    "%s uses current text rather than a stale parse",
    (action) => {
      const store = useJsonEditor.getState();
      store.setParseResult({ stale: true }, []);
      store.setText("{\"z\":2,\"a\":1}");
      store[action]();
      const text = useJsonEditor.getState().text;
      expect(JSON.parse(text)).toEqual({ z: 2, a: 1 });
      if (action === "minify") expect(text).toBe("{\"z\":2,\"a\":1}");
      if (action === "sortKeysAction") {
        expect(text.indexOf("\"a\"")).toBeLessThan(text.indexOf("\"z\""));
      }
    },
  );

  it.each(["format", "minify", "sortKeysAction"] as const)(
    "%s leaves incomplete current text intact",
    (action) => {
      const store = useJsonEditor.getState();
      store.setParseResult({ stale: true }, []);
      store.setText("{\"unfinished\":");
      store[action]();
      expect(useJsonEditor.getState().text).toBe("{\"unfinished\":");
    },
  );

  it.each(["format", "minify", "sortKeysAction"] as const)(
    "%s handles the valid JSON null value",
    (action) => {
      const store = useJsonEditor.getState();
      store.setText(" null ");
      store[action]();
      expect(useJsonEditor.getState().text).toBe("null");
    },
  );
});

describe("stripVolatile", () => {
  it("nulls parsedValue and diagnostics", () => {
    const state = {
      ...DEFAULT_STATE,
      parsedValue: { a: 1 },
      diagnostics: [{ severity: "error" as const, message: "x" }],
    };
    const out = stripVolatile(state);
    expect(out.parsedValue).toBeNull();
    expect(out.diagnostics).toEqual([]);
  });

  it("truncates text if longer than MAX_PERSIST_BYTES", () => {
    const big = "a".repeat(300 * 1024);
    const out = stripVolatile({ ...DEFAULT_STATE, text: big });
    expect(out.text.length).toBeLessThan(big.length);
  });
});
