"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type UIEvent,
} from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useRegexTester } from "@/lib/stores/regex-tester";
import type { MatchResult } from "@/lib/regex-tester/types";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import { HighlightOverlay } from "./highlight-overlay";
import { FileDropZone, MAX_DROP_BYTES } from "./file-drop-zone";

export const MAX_TEST_BYTES = 100 * 1024;

export interface TestStringAreaProps {
  matches: MatchResult[];
  hoveredMatchId: number | null;
  onHoverMatch: (id: number | null) => void;
}

export interface TestStringAreaHandle {
  focus: () => void;
  focusAtIndex: (index: number, length: number) => void;
}

function byteLength(value: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value).length;
  }
  return value.length;
}

function clipToByteLimit(value: string, limit: number): string {
  if (byteLength(value) <= limit) return value;
  // Binary search for the largest prefix that fits in the byte budget.
  let lo = 0;
  let hi = value.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (byteLength(value.slice(0, mid)) <= limit) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return value.slice(0, lo);
}

export const TestStringArea = forwardRef<
  TestStringAreaHandle,
  TestStringAreaProps
>(function TestStringArea(
  { matches, hoveredMatchId, onHoverMatch },
  ref,
) {
  const testString = useRegexTester((s) => s.testString);
  const setTestString = useRegexTester((s) => s.setTestString);
  const { toast } = useToast();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLPreElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => textareaRef.current?.focus(),
      focusAtIndex: (index, length) => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.focus();
        const end = Math.min(ta.value.length, index + Math.max(0, length));
        try {
          ta.setSelectionRange(index, end);
        } catch {
          // ignore selection failures (e.g. cross-origin frames)
        }
        // Approximate scroll-into-view based on line position.
        const before = ta.value.slice(0, index);
        const line = before.split("\n").length - 1;
        const computed = window.getComputedStyle(ta);
        const lineHeight = parseFloat(computed.lineHeight);
        if (!Number.isNaN(lineHeight) && lineHeight > 0) {
          ta.scrollTop = Math.max(0, line * lineHeight - ta.clientHeight / 3);
        }
      },
    }),
    [],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      if (byteLength(next) > MAX_TEST_BYTES) {
        const clipped = clipToByteLimit(next, MAX_TEST_BYTES);
        setTestString(clipped);
        toast({
          title: "Test string trimmed",
          description: "Input exceeds the 100 KB limit and was clipped.",
          variant: "destructive",
        });
        return;
      }
      setTestString(next);
    },
    [setTestString, toast],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLTextAreaElement>) => {
      const pasted = e.clipboardData.getData("text");
      if (!pasted) return;

      const target = e.currentTarget;
      const start = target.selectionStart ?? testString.length;
      const end = target.selectionEnd ?? testString.length;
      const next =
        testString.slice(0, start) + pasted + testString.slice(end);

      if (byteLength(next) > MAX_TEST_BYTES) {
        e.preventDefault();
        const clipped = clipToByteLimit(next, MAX_TEST_BYTES);
        setTestString(clipped);
        toast({
          title: "Paste clipped",
          description:
            "Pasted content exceeds the 100 KB limit and was trimmed.",
          variant: "destructive",
        });
      }
    },
    [testString, setTestString, toast],
  );

  const handleScroll = useCallback((e: UIEvent<HTMLTextAreaElement>) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.scrollTop = e.currentTarget.scrollTop;
    overlay.scrollLeft = e.currentTarget.scrollLeft;
  }, []);

  const handleClear = useCallback(() => {
    setTestString("");
    onHoverMatch(null);
    textareaRef.current?.focus();
  }, [setTestString, onHoverMatch]);

  useEffect(() => {
    // Keep overlay scroll aligned when textarea content shrinks below scroll offset.
    const overlay = overlayRef.current;
    const textarea = textareaRef.current;
    if (overlay && textarea) {
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    }
  }, [testString]);

  const bytes = byteLength(testString);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor="regex-test-string"
          className="text-sm font-medium text-foreground"
        >
          Test string
        </label>
        <div className="flex items-center gap-2">
          <CopyButton text={testString} label="test string" size="icon" />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
            disabled={testString.length === 0}
            aria-label="Clear test string"
            className="shrink-0 min-h-touch min-w-touch"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <HighlightOverlay
          ref={overlayRef}
          text={testString}
          matches={matches}
          hoveredMatchId={hoveredMatchId}
          onHoverMatch={onHoverMatch}
        />
        <Textarea
          id="regex-test-string"
          ref={textareaRef}
          value={testString}
          onChange={handleChange}
          onPaste={handlePaste}
          onScroll={handleScroll}
          placeholder="Paste or type the text you want to test against."
          aria-label="Test string"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className={cn(
            "relative bg-transparent text-transparent caret-foreground",
            "font-mono text-sm leading-relaxed",
            "min-h-[10rem] resize-y",
          )}
        />
        <FileDropZone
          onText={(text) => {
            const clipped =
              byteLength(text) > MAX_DROP_BYTES
                ? clipToByteLimit(text, MAX_DROP_BYTES)
                : text;
            setTestString(clipped);
          }}
        />
      </div>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {(bytes / 1024).toFixed(1)} KB / 100 KB
      </p>
    </div>
  );
});
