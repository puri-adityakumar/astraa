"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { hashAlgorithms } from "@/lib/hash";

interface HashOutputProps {
  type: string;
  hash: string;
}

export function HashOutput({ type, hash }: HashOutputProps) {
  const copy = useCopyToClipboard();
  const algorithm = hashAlgorithms.find((algo) => algo.id === type);

  const handleCopyToClipboard = async () => {
    await copy(hash, "Copied!");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={type}>{algorithm?.name || type.toUpperCase()}</Label>
      <div className="flex items-center gap-2">
        <Input id={type} value={hash} readOnly className="font-mono text-xs sm:text-sm" />
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopyToClipboard}
          disabled={!hash}
          className="shrink-0"
          aria-label="Copy hash"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
