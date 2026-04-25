"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  drawSelection,
  highlightActiveLine,
  placeholder as cmPlaceholder,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { search, searchKeymap, openSearchPanel } from "@codemirror/search";
import { markdown } from "@codemirror/lang-markdown";

export type EditorHandle = {
  insertAtCursor: (text: string) => void;
  wrapSelection: (prefix: string, suffix?: string) => void;
  openSearch: () => void;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  onDropFile?: (file: File) => void;
};

export const Editor = forwardRef<EditorHandle, Props>(function Editor(
  { value, onChange, onDropFile },
  ref,
) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onDropRef = useRef(onDropFile);

  useEffect(() => {
    onChangeRef.current = onChange;
    onDropRef.current = onDropFile;
  }, [onChange, onDropFile]);

  useEffect(() => {
    if (!hostRef.current) return;
    const themeCompartment = new Compartment();

    const state = EditorState.create({
      doc: value,
      extensions: [
        history(),
        lineNumbers(),
        drawSelection(),
        highlightActiveLine(),
        cmPlaceholder("Start writing Markdown… (drag images, $math$, ```mermaid``` diagrams supported)"),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab]),
        search(),
        markdown(),
        themeCompartment.of([]),
        EditorView.lineWrapping,
        EditorView.updateListener.of((u) => {
          if (u.docChanged) {
            onChangeRef.current(u.state.doc.toString());
          }
        }),
        EditorView.domEventHandlers({
          drop(event) {
            const file = event.dataTransfer?.files?.[0];
            if (file && onDropRef.current) {
              event.preventDefault();
              onDropRef.current(file);
              return true;
            }
            return false;
          },
        }),
      ],
    });

    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  useImperativeHandle(
    ref,
    () => ({
      insertAtCursor: (text) => {
        const view = viewRef.current;
        if (!view) return;
        const { from, to } = view.state.selection.main;
        view.dispatch({
          changes: { from, to, insert: text },
          selection: { anchor: from + text.length },
        });
        view.focus();
      },
      wrapSelection: (prefix, suffix = prefix) => {
        const view = viewRef.current;
        if (!view) return;
        const { from, to } = view.state.selection.main;
        const selected = view.state.sliceDoc(from, to);
        const wrapped = `${prefix}${selected}${suffix}`;
        view.dispatch({
          changes: { from, to, insert: wrapped },
          selection: {
            anchor: from + prefix.length,
            head: from + prefix.length + selected.length,
          },
        });
        view.focus();
      },
      openSearch: () => {
        const view = viewRef.current;
        if (!view) return;
        openSearchPanel(view);
      },
    }),
    [],
  );

  return <div ref={hostRef} className="h-full overflow-auto text-sm" />;
});
