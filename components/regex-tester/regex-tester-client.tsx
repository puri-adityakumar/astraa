"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PatternRow } from "./pattern-row";
import type { PatternHighlightInputHandle } from "./pattern-highlight-input";
import { TestStringArea, type TestStringAreaHandle } from "./test-string-area";
import { MatchesPanel } from "./matches-panel";
import { ReplacePanel } from "./replace-panel";
import { ReferencePanel } from "./reference-panel";
import { ReferenceSheet } from "./reference-sheet";
import { StatusFooter } from "./status-footer";
import { useRegexTester } from "@/lib/stores/regex-tester";
import { compileRegex } from "@/lib/regex-tester/compile";
import { runMatches } from "@/lib/regex-tester/match";
import { encodeState, decodeState } from "@/lib/regex-tester/url-state";
import { debounce } from "@/lib/regex-tester/debounce";
import { runMatchesSafe } from "@/lib/regex-tester/redos-client";
import { useToolSettings } from "@/lib/stores/tool-settings";
import { copyToClipboard } from "@/lib/clipboard";

const TEST_BYTE_CAP = 100 * 1024;
const DEBOUNCE_MS = 150;

export function RegexTesterClient() {
  const pattern = useRegexTester((s) => s.pattern);
  const flags = useRegexTester((s) => s.flags);
  const testString = useRegexTester((s) => s.testString);
  const replacement = useRegexTester((s) => s.replacement);
  const setPattern = useRegexTester((s) => s.setPattern);
  const setFlags = useRegexTester((s) => s.setFlags);
  const setTestString = useRegexTester((s) => s.setTestString);
  const setReplacement = useRegexTester((s) => s.setReplacement);

  const { toast } = useToast();

  const [hoveredMatchId, setHoveredMatchId] = useState<number | null>(null);
  const [debouncedPattern, setDebouncedPattern] = useState(pattern);
  const [debouncedFlags, setDebouncedFlags] = useState(flags);
  const [debouncedTest, setDebouncedTest] = useState(testString);
  const [hardTimeout, setHardTimeout] = useState(false);
  const testStringRef = useRef<TestStringAreaHandle>(null);
  const patternInputRef = useRef<PatternHighlightInputHandle>(null);

  const handleInsertAtCaret = useCallback(
    (text: string) => {
      if (patternInputRef.current) {
        patternInputRef.current.insertAtCaret(text);
        return;
      }
      setPattern(pattern + text);
    },
    [pattern, setPattern],
  );

  // Hydrate from URL hash on mount; URL wins for first paint.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    if (typeof window === "undefined") return;
    const parsed = decodeState(window.location.hash);
    if (!parsed) return;
    if (parsed.pattern) setPattern(parsed.pattern);
    if (parsed.flags) setFlags(parsed.flags);
    if (parsed.test) setTestString(parsed.test);
    if (parsed.replacement) setReplacement(parsed.replacement);
  }, [setPattern, setFlags, setTestString, setReplacement]);

  // Replicate persisted state back into the URL hash (debounced).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = debounce(() => {
      const { hash } = encodeState({
        pattern,
        flags,
        test: testString,
        replacement,
      });
      const next = `#${hash}`;
      if (window.location.hash !== next) {
        window.history.replaceState(null, "", next);
      }
    }, DEBOUNCE_MS);
    sync();
    return sync.cancel;
  }, [pattern, flags, testString, replacement]);

  // Mirror the live inputs into debounced versions used for derivations.
  useEffect(() => {
    const sync = debounce(() => {
      setDebouncedPattern(pattern);
      setDebouncedFlags(flags);
      setDebouncedTest(testString);
    }, DEBOUNCE_MS);
    sync();
    return sync.cancel;
  }, [pattern, flags, testString]);

  useEffect(() => {
    useToolSettings.getState().updateToolUsage("regex-tester");
  }, []);

  const compileResult = useMemo(
    () => compileRegex(debouncedPattern, debouncedFlags),
    [debouncedPattern, debouncedFlags],
  );

  const patternError =
    !compileResult.ok && pattern.length > 0 ? compileResult.error : null;

  const matchResult = useMemo(() => {
    if (!compileResult.ok) {
      return { results: [], elapsedMs: 0, capped: false, timedOut: false };
    }
    return runMatches(compileResult.regex, debouncedTest);
  }, [compileResult, debouncedTest]);

  const matches = matchResult.results;

  useEffect(() => {
    let cancelled = false;
    if (!matchResult.timedOut) {
      setHardTimeout(false);
      return () => {
        cancelled = true;
      };
    }
    runMatchesSafe(debouncedPattern, debouncedFlags, debouncedTest).then(
      (safe) => {
        if (cancelled) return;
        setHardTimeout(safe.hardTimeout);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [matchResult.timedOut, debouncedPattern, debouncedFlags, debouncedTest]);

  const handleJumpToMatch = useCallback(
    (matchId: number) => {
      const match = matches[matchId];
      if (!match) return;
      testStringRef.current?.focusAtIndex(match.index, match.length);
    },
    [matches],
  );

  const handleShare = useCallback(async () => {
    if (typeof window === "undefined") return;
    const { hash, truncated } = encodeState({
      pattern,
      flags,
      test: testString,
      replacement,
    });
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    const result = await copyToClipboard(url);
    if (!result.success) {
      toast({
        title: "Could not copy link",
        description: result.error,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: truncated ? "Shareable link copied" : "Link copied",
      description: truncated
        ? "Test string trimmed to 8 KB to fit in the URL."
        : "URL with the current pattern + test is on your clipboard.",
    });
  }, [pattern, flags, testString, replacement, toast]);

  const testBytes = useMemo(() => {
    if (typeof TextEncoder !== "undefined") {
      return new TextEncoder().encode(testString).length;
    }
    return testString.length;
  }, [testString]);

  return (
    <div className="container px-4 sm:px-6 max-w-2xl pt-24 pb-12 space-y-8">
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Regex Tester
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Test JavaScript regular expressions live, with capture-group highlights, replace mode, and shareable URLs.
        </p>
        <p className="text-xs text-muted-foreground/70">
          All processing happens locally in your browser
        </p>
      </div>
      <Card className="p-4 sm:p-6 space-y-6">
        <PatternRow
          ref={patternInputRef}
          error={patternError}
          onShare={handleShare}
        />
        <TestStringArea
          ref={testStringRef}
          matches={matches}
          hoveredMatchId={hoveredMatchId}
          onHoverMatch={setHoveredMatchId}
        />
        <MatchesPanel
          matches={matches}
          hoveredMatchId={hoveredMatchId}
          onHoverMatch={setHoveredMatchId}
          onJumpToMatch={handleJumpToMatch}
        />
        <ReplacePanel />
        <div className="hidden sm:block">
          <ReferencePanel onInsertAtCaret={handleInsertAtCaret} />
        </div>
        <StatusFooter
          matchCount={matches.length}
          elapsedMs={matchResult.elapsedMs}
          bytes={testBytes}
          cap={TEST_BYTE_CAP}
          timedOut={matchResult.timedOut}
          hardTimeout={hardTimeout}
        />
      </Card>
      <ReferenceSheet onInsertAtCaret={handleInsertAtCaret} />
    </div>
  );
}
