"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, RotateCw } from "lucide-react";
import { normalizeBrowserUrl } from "@/lib/terminal/commands/browser";
import { cn } from "@/lib/utils";
import { PanelFrame } from "./panel-frame";

interface BrowserPanelProps {
  /** Canonical current page from the shell; null shows the start page. */
  url: string | null;
  canBack: boolean;
  canForward: boolean;
  onBack: () => void;
  onForward: () => void;
  /** Reports a fresh visit (or null for the start page) to the shell. */
  onNavigate: (url: string | null) => void;
  onClose: () => void;
}

const NAV_BUTTON = cn(
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-md",
  "text-term-muted hover:bg-term-surface2 hover:text-term-fg",
  "disabled:pointer-events-none disabled:opacity-40",
);

/**
 * The browser panel: a sandboxed iframe with an address bar. The shell owns
 * the navigation state (current page plus back/forward stacks) — fresh
 * visits flow through onNavigate, history moves through onBack and
 * onForward, and the address field re-seeds from the canonical url via the
 * render-time prop sync below. Sites that send X-Frame-Options refuse to
 * embed; the ↗ button is the escape hatch. The iframe sandbox omits
 * allow-top-navigation, so framed pages can never navigate the terminal
 * itself.
 */
export function BrowserPanel({
  url,
  canBack,
  canForward,
  onBack,
  onForward,
  onNavigate,
  onClose,
}: BrowserPanelProps) {
  const [address, setAddress] = useState(url ?? "");
  const [lastUrl, setLastUrl] = useState(url);
  const [invalid, setInvalid] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Adjusting state when a prop changes (react.dev/learn): a url the panel
  // did not type itself — a fresh /browser run, back or forward — re-seeds
  // the field; typed text stays local until submit.
  if (url !== lastUrl) {
    setLastUrl(url);
    setAddress(url ?? "");
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = normalizeBrowserUrl(address);
    if (next === null) {
      setInvalid(address.trim());
      return;
    }
    setInvalid(null);
    if (next === url) {
      setReloadKey((key) => key + 1);
      return;
    }
    onNavigate(next);
  };

  return (
    <PanelFrame title="Browser" panelKey="browser" focusKey="browser" onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Back"
          disabled={!canBack}
          onClick={onBack}
          className={NAV_BUTTON}
        >
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Forward"
          disabled={!canForward}
          onClick={onForward}
          className={NAV_BUTTON}
        >
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Reload"
          disabled={url === null}
          onClick={() => setReloadKey((key) => key + 1)}
          className={NAV_BUTTON}
        >
          <RotateCw aria-hidden="true" className="h-5 w-5" />
        </button>
        <label htmlFor="term-browser-address" className="sr-only">
          Address
        </label>
        <input
          id="term-browser-address"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="example.com"
          className="min-h-touch min-w-0 flex-1 rounded-md border border-term-surface2 bg-term-bg px-3 font-mono text-sm text-term-fg outline-none placeholder:text-term-muted focus-visible:border-term-accent"
        />
        {url !== null ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in a new tab"
            className={NAV_BUTTON}
          >
            <ExternalLink aria-hidden="true" className="h-5 w-5" />
          </a>
        ) : (
          <span aria-hidden="true" className={cn(NAV_BUTTON, "opacity-40")}>
            <ExternalLink className="h-5 w-5" />
          </span>
        )}
      </form>
      {invalid !== null && (
        <p role="alert" className="mt-2 font-mono text-xs text-term-red">
          {`That doesn't look like a web address: "${invalid}".`}
        </p>
      )}
      <p className="mt-2 font-mono text-xs text-term-muted">
        Some sites (google.com, github.com…) refuse to load in a frame — use ↗ to open
        them in a new tab.
      </p>
      {url !== null ? (
        <iframe
          key={reloadKey}
          src={url}
          title="Browser panel page"
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          className="mt-3 h-[60vh] min-h-80 w-full rounded-md border border-term-surface2 bg-term-bg"
        />
      ) : (
        <div className="mt-3 flex h-[60vh] min-h-80 flex-col items-center justify-center gap-2 rounded-md border border-term-surface2 font-mono text-sm text-term-muted">
          <p>Type an address above.</p>
          <p>Or run /browser example.com.</p>
        </div>
      )}
    </PanelFrame>
  );
}
