"use client";

import { useMemo } from "react";
import { useRegexTester } from "@/lib/stores/regex-tester";
import { tokenize } from "@/lib/regex-tester/tokenize";
import { buildExplainTree } from "@/lib/regex-tester/explain";
import type { ExplainNode } from "@/lib/regex-tester/types";
import { cn } from "@/lib/utils";

function ExplainTreeNode({
  node,
  depth,
}: {
  node: ExplainNode;
  depth: number;
}) {
  return (
    <li>
      <div
        className={cn(
          "flex flex-col gap-0.5 py-1 px-2 rounded",
          "hover:bg-muted/40 transition-colors duration-100 ease-out",
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        <span className="text-sm font-medium text-foreground">
          {node.label}
        </span>
        {node.detail && (
          <span className="text-xs text-muted-foreground">{node.detail}</span>
        )}
      </div>
      {node.children && node.children.length > 0 && (
        <ul className="space-y-0.5">
          {node.children.map((child) => (
            <ExplainTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function ExplainPanel() {
  const pattern = useRegexTester((s) => s.pattern);

  const tree = useMemo(() => {
    if (pattern.length === 0) return [];
    const tokens = tokenize(pattern).tokens;
    return buildExplainTree(tokens);
  }, [pattern]);

  if (pattern.length === 0) {
    return (
      <p className="text-sm italic text-muted-foreground">
        Type a pattern to see how each piece is interpreted.
      </p>
    );
  }

  if (tree.length === 0) {
    return (
      <p className="text-sm italic text-muted-foreground">
        Could not parse this pattern into an explain tree.
      </p>
    );
  }

  return (
    <ul className="space-y-0.5 max-h-80 overflow-y-auto" role="tree">
      {tree.map((node) => (
        <ExplainTreeNode key={node.id} node={node} depth={0} />
      ))}
    </ul>
  );
}
