"use client";

import { cn } from "@/lib/utils";

interface PasswordDisplayProps {
  password: string;
}

export function PasswordDisplay({ password }: PasswordDisplayProps) {
  return (
    <div className="w-full">
      <div
        className={cn(
          "relative flex min-h-[100px] items-center justify-center rounded-lg p-4 transition-all duration-200 sm:min-h-[120px] sm:p-6",
          "border-2 border-border/60 bg-background",
          "hover:border-primary/20 hover:shadow-sm",
        )}
      >
        {password ? (
          <div className="break-all text-center font-mono text-xl font-medium tracking-wide text-foreground duration-200 animate-in fade-in zoom-in-50 sm:text-3xl md:text-4xl">
            {password}
          </div>
        ) : (
          <div className="text-base font-medium text-muted-foreground/40 sm:text-lg">
            Generate a password
          </div>
        )}
      </div>
    </div>
  );
}
