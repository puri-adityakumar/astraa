"use client";

import { useEffect, useRef } from "react";
import { decodeState, encodeState } from "@/lib/regex-tester/url-state";
import { debounce } from "@/lib/regex-tester/debounce";

const DEBOUNCE_MS = 150;

export interface RegexUrlState {
  pattern: string;
  flags: string;
  testString: string;
  replacement: string;
}

export interface RegexUrlStateSetters {
  setPattern: (value: string) => void;
  setFlags: (value: string) => void;
  setTestString: (value: string) => void;
  setReplacement: (value: string) => void;
}

/**
 * Hydrates regex-tester state from the URL hash on mount (URL wins for the
 * first paint), then mirrors the current state back into the URL hash
 * (debounced) whenever it changes via `history.replaceState`.
 *
 * The hydration runs exactly once: a ref guards it so it stays mount-only
 * regardless of the setters' identity. Subsequent writes are one-way
 * (state -> URL).
 */
export function useRegexUrlState(state: RegexUrlState, setters: RegexUrlStateSetters): void {
  const { pattern, flags, testString, replacement } = state;
  const { setPattern, setFlags, setTestString, setReplacement } = setters;

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
}
