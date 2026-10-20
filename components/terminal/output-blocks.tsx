"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";
import type { OutputBlock } from "@/lib/terminal/types";

/** How long the Copy button shows "Copied" after a successful copy. */
const COPIED_RESET_MS = 2000;

/**
 * The secret block — the only way a password renders in the terminal. The
 * value is length-matched bullets until Reveal; the element carrying the
 * text (dots or plaintext) is Sentry-masked so replays capture neither
 * state.
 */
function SecretBlock({ secret }: { secret: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedResetRef.current) clearTimeout(copiedResetRef.current);
    };
  }, []);

  const handleCopy = async () => {
    const result = await copyToClipboard(secret);
    if (!result.success) return;
    setCopied(true);
    if (copiedResetRef.current) clearTimeout(copiedResetRef.current);
    copiedResetRef.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <div className="space-y-2">
      <span
        data-sentry-mask
        className="sentry-mask block whitespace-pre-wrap break-all font-mono text-sm tracking-widest text-term-fg"
      >
        {revealed ? secret : "•".repeat(secret.length)}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-pressed={revealed}
          onClick={() => setRevealed((previous) => !previous)}
          className="flex min-h-touch min-w-[7.5ch] items-center justify-center rounded-md border border-term-surface2 px-3 font-mono text-sm text-term-muted hover:bg-term-surface2 hover:text-term-fg"
        >
          {revealed ? "Hide" : "Reveal"}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex min-h-touch min-w-[7.5ch] items-center justify-center rounded-md border border-term-surface2 px-3 font-mono text-sm hover:bg-term-surface2",
            copied ? "text-term-green" : "text-term-muted hover:text-term-fg",
          )}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/**
 * Splits a kv value's trailing status (" · live" / " · coming soon") into a
 * no-wrap span so the status never wraps alone, orphaned from the summary it
 * qualifies. Values without the suffix render unchanged.
 */
function renderValue(value: string): ReactNode {
  if (!value.endsWith(" · live") && !value.endsWith(" · coming soon")) {
    return value;
  }
  const separator = value.lastIndexOf(" · ");
  const summary = value.slice(0, separator);
  const status = value.slice(separator + " · ".length);
  return (
    <>
      {summary}
      <span className="whitespace-nowrap">{" · " + status}</span>
    </>
  );
}

function SingleBlock({ block }: { block: OutputBlock }) {
  switch (block.type) {
    case "text":
      return (
        <p className="whitespace-pre-wrap break-words font-mono text-sm leading-6 text-term-fg">
          {block.text}
        </p>
      );
    case "error":
      return (
        <p className="whitespace-pre-wrap break-words font-mono text-sm leading-6 text-term-red">
          {block.text}
        </p>
      );
    case "kv":
      // Shared key column at sm+ so /help categories and the theme list all
      // align their values to one grid line without squeezing mobile values.
      return (
        <div
          className={cn(
            "grid grid-cols-[minmax(0,40%)_minmax(0,1fr)] gap-x-4 gap-y-2",
            "font-mono text-sm leading-6 sm:grid-cols-[13rem_minmax(0,1fr)]",
          )}
        >
          {block.entries.map((entry, index) => (
            <div key={index} className="contents">
              <span className="text-term-accent [overflow-wrap:anywhere]">{entry.key}</span>
              <span className="min-w-0 break-words text-term-muted">{renderValue(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    case "code":
      return (
        <pre className="overflow-x-auto rounded-md border border-term-surface2 bg-term-surface p-3 font-mono text-sm text-term-fg">
          <code className="whitespace-pre">{block.code}</code>
        </pre>
      );
    case "list":
      return (
        <ul
          className={cn(
            "list-disc space-y-1 break-words pl-5 font-mono text-sm leading-6",
            "text-term-fg marker:text-term-muted",
          )}
        >
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    case "secret":
      return <SecretBlock secret={block.secret} />;
  }
}

/** Renders a command result's output blocks in the scrollback. */
export function OutputBlocks({ blocks }: { blocks: readonly OutputBlock[] }) {
  return (
    <div className="space-y-2">
      {blocks.map((block, index) => (
        <SingleBlock key={index} block={block} />
      ))}
    </div>
  );
}
