"use client";

import { Laptop, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

interface ThemeOption {
  label: string;
  value: "system" | "light" | "dark";
  icon: LucideIcon;
}

const THEME_OPTIONS: ThemeOption[] = [
  { label: "Use system theme", value: "system", icon: Laptop },
  { label: "Use light theme", value: "light", icon: Sun },
  { label: "Use dark theme", value: "dark", icon: Moon },
];

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <div
      className="inline-flex items-center rounded-full border bg-background p-0.5 shadow-geist"
      role="radiogroup"
      aria-label="Select display theme"
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={cn(
              "inline-flex h-9 min-h-touch w-9 min-w-touch items-center justify-center " +
                "rounded-full text-muted-foreground transition-colors duration-150 " +
                "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 " +
                "focus-visible:ring-ring",
              isActive && "bg-muted text-foreground",
            )}
            onClick={() => setTheme(option.value)}
            role="radio"
            aria-checked={isActive}
            aria-label={option.label}
            title={option.label}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
