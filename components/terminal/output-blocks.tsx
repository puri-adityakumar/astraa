import type { OutputBlock } from "@/lib/terminal/types";

function SingleBlock({ block }: { block: OutputBlock }) {
  switch (block.type) {
    case "text":
      return (
        <p className="whitespace-pre-wrap font-mono text-sm text-term-fg">{block.text}</p>
      );
    case "error":
      return (
        <p className="whitespace-pre-wrap font-mono text-sm text-term-red">{block.text}</p>
      );
    case "kv":
      return (
        <div className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-4 gap-y-1 font-mono text-sm">
          {block.entries.map((entry) => (
            <div key={`${entry.key} ${entry.value}`} className="contents">
              <span className="whitespace-nowrap text-term-accent">{entry.key}</span>
              <span className="min-w-0 break-words text-term-muted">{entry.value}</span>
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
        <ul className="list-disc space-y-1 pl-5 font-mono text-sm text-term-fg marker:text-term-muted">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "secret":
      // Reveal/Copy controls arrive with the password feature; dots-only stub.
      return (
        <span className="font-mono text-sm tracking-widest text-term-fg">
          {"•".repeat(block.secret.length)}
        </span>
      );
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
