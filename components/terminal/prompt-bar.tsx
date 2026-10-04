/**
 * Sticky bottom prompt bar with the `guest@astraa >` label. Visual shell
 * only for now — echo, history, autocomplete and keyboard shortcuts are
 * added by the prompt feature.
 */
export function PromptBar() {
  return (
    <div className="shrink-0 border-t border-term-surface2 bg-term-surface px-4 py-3">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-2 font-mono text-sm">
        <label htmlFor="term-prompt" className="sr-only">
          Terminal command
        </label>
        <span aria-hidden="true" className="select-none whitespace-nowrap text-term-green">
          guest@astraa &gt;
        </span>
        <input
          id="term-prompt"
          type="text"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="/help"
          className="min-h-touch w-full min-w-0 bg-transparent text-term-fg outline-none placeholder:text-term-muted"
        />
      </div>
    </div>
  );
}
