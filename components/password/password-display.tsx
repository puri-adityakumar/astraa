"use client"

import { cn } from "@/lib/utils"

interface PasswordDisplayProps {
  password: string
}

export function PasswordDisplay({ password }: PasswordDisplayProps) {
  return (
    <div
      className={cn(
        "relative rounded-[var(--radius)] border p-[18px_16px_14px]",
        "[background:hsl(var(--muted))] [border-color:var(--hairline,hsl(var(--border)))]",
      )}
    >
      <p
        className="font-mono text-[9.5px] tracking-[0.16em] uppercase mb-[10px] flex justify-between items-center"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        Generated password
      </p>
      {password ? (
        <p
          className="font-mono text-[21px] font-medium tracking-[0.02em] break-all leading-[1.4] mb-[14px]"
          style={{ color: "hsl(var(--foreground))" }}
        >
          {password.split("").map((ch, i) => {
            const isSymbol = /[^a-zA-Z0-9]/.test(ch);
            return isSymbol ? (
              <span key={i} style={{ color: "hsl(var(--muted-foreground))" }}>
                {ch}
              </span>
            ) : (
              <span key={i}>{ch}</span>
            );
          })}
        </p>
      ) : (
        <p
          className="font-mono text-[21px] font-medium tracking-[0.02em] mb-[14px] opacity-30"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          — — — — —
        </p>
      )}
    </div>
  )
}
