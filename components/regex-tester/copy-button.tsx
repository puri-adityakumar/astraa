"use client";

import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

export interface CopyButtonProps {
  text: string;
  label: string;
  size?: ButtonProps["size"];
  className?: string;
  disabled?: boolean;
}

export function CopyButton({
  text,
  label,
  size = "icon",
  className,
  disabled,
}: CopyButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const result = await copyToClipboard(text);
    if (result.success) {
      setCopied(true);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      window.setTimeout(() => setCopied(false), 1500);
    } else {
      toast({
        title: "Copy failed",
        description: result.error,
        variant: "destructive",
      });
    }
  }, [text, label, toast]);

  const isIcon = size === "icon";

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={handleCopy}
      disabled={disabled || text.length === 0}
      aria-label={`Copy ${label}`}
      className={cn(
        "shrink-0 min-h-touch",
        isIcon && "min-w-touch",
        className,
      )}
    >
      {copied ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
      {!isIcon && <span className="ml-2">Copy</span>}
    </Button>
  );
}
