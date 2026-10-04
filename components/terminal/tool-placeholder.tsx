import { toolDisplayName } from "./tool-names";

/** Static stand-in for a tool panel on direct /tools/<slug> loads. */
export function ToolPlaceholder({ tool }: { tool: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h2 className="font-sans text-xl text-term-fg">{toolDisplayName(tool)}</h2>
      <p
        data-term-panel-placeholder={tool}
        className="mt-2 font-mono text-sm text-term-muted"
      >
        {`/${tool} opens here as a panel.`}
      </p>
    </div>
  );
}
