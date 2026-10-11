"use client";

import { isTermTheme, TERM_THEMES } from "@/lib/terminal/cookies";
import { useTerminalTheme } from "./terminal-theme";

/**
 * The sidebar scheme picker: a native select of the 7 theme options (6
 * schemes + auto) that applies the choice instantly — state, cookie and
 * attribute update without a reload, mirroring /theme <name>.
 */
export function SchemePicker() {
  const { theme, setTheme } = useTerminalTheme();

  return (
    <div className="px-2 py-1">
      <label
        htmlFor="term-theme-picker"
        className="block px-1 pb-1 font-mono text-sm text-term-muted"
      >
        Colour scheme
      </label>
      <select
        id="term-theme-picker"
        value={theme}
        onChange={(event) => {
          const next = event.target.value;
          if (isTermTheme(next)) setTheme(next);
        }}
        className="min-h-touch w-full rounded-md border border-term-surface2 bg-term-surface px-3 font-mono text-sm text-term-fg focus-visible:bg-term-surface2"
      >
        {TERM_THEMES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
