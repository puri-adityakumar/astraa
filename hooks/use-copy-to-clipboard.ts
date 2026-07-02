"use client";

import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { copyToClipboard } from "@/lib/clipboard";

/**
 * Returns a memoized `copy(text, successMessage?)` function that copies the
 * given text via the shared `copyToClipboard` helper and surfaces the outcome
 * as a toast (success or destructive). Returns the boolean success flag.
 */
export function useCopyToClipboard(): (text: string, successMessage?: string) => Promise<boolean> {
  const { toast } = useToast();

  return useCallback(
    async (text: string, successMessage?: string) => {
      const result = await copyToClipboard(text);
      if (result.success) {
        toast({ title: successMessage ?? "Copied" });
      } else {
        toast({
          title: "Copy failed",
          description: result.error,
          variant: "destructive",
        });
      }
      return result.success;
    },
    [toast],
  );
}
