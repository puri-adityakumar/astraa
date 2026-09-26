"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, lineNumbers, keymap } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import { autocompletion } from "@codemirror/autocomplete";
import { useTheme } from "next-themes";
import { useJsonEditor } from "@/lib/stores/json-editor";
import { oneDark } from "@codemirror/theme-one-dark";

export function TextView() {
  const text = useJsonEditor((s) => s.text);
  const setText = useJsonEditor((s) => s.setText);
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const isDark = resolvedTheme === "dark";
    const state = EditorState.create({
      doc: text,
      extensions: [
        lineNumbers(),
        history(),
        json(),
        linter(jsonParseLinter()),
        lintGutter(),
        autocompletion(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setText(update.state.doc.toString());
          }
        }),
        ...(isDark ? [oneDark] : []),
      ],
    });
    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;
    return () => view.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  useEffect(() => {
    const v = viewRef.current;
    if (!v) return;
    if (v.state.doc.toString() !== text) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: text } });
    }
  }, [text]);

  return <div ref={containerRef} className="h-[60vh] border rounded-md overflow-auto" />;
}
