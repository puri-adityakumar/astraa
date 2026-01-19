import React, { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor,
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    // Default colors based on theme
    const defaultShimmerColor = shimmerColor || "#10b981"; // emerald for light, will be overridden in dark
    const defaultBackground = background || "rgba(255, 255, 255, 0.9)"; // white for light, will be overridden in dark

    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": defaultShimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": defaultBackground,
          } as CSSProperties
        }
        className={cn(
          // Base styles
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3 [border-radius:var(--radius)]",
          // Light mode: white background with emerald border and dark text
          "border-2 border-emerald-500/30 bg-white/90 text-slate-900",
          // Dark mode: dark background with purple border and light text
          "dark:border-purple-400/30 dark:bg-purple-900/90 dark:text-white",
          // Interaction states
          "transform-gpu transition-all duration-300 ease-in-out active:translate-y-px",
          "hover:border-emerald-500/50 dark:hover:border-purple-400/50",
          "hover:shadow-lg hover:shadow-emerald-500/20 dark:hover:shadow-purple-500/20",
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "absolute inset-0 overflow-visible [container-type:size]",
          )}
        >
          {/* spark */}
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            {/* spark before - different colors for light/dark */}
            <div className="absolute -inset-full w-auto rotate-0 animate-spin-around bg-[conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,#10b981_var(--spread),transparent_var(--spread))] [translate:0_0] dark:bg-[conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,#a78bfa_var(--spread),transparent_var(--spread))]" />
          </div>
        </div>
        {children}

        {/* Highlight */}
        <div
          className={cn(
            "insert-0 absolute size-full",
            "rounded-2xl px-4 py-1.5 text-sm font-medium",
            // Light mode shadows
            "shadow-[inset_0_-8px_10px_rgba(16,185,129,0.1)]",
            // Dark mode shadows
            "dark:shadow-[inset_0_-8px_10px_rgba(167,139,250,0.1)]",
            // Transition
            "transform-gpu transition-all duration-300 ease-in-out",
            // Hover - light mode
            "group-hover:shadow-[inset_0_-6px_10px_rgba(16,185,129,0.2)]",
            // Hover - dark mode
            "dark:group-hover:shadow-[inset_0_-6px_10px_rgba(167,139,250,0.2)]",
            // Active - light mode
            "group-active:shadow-[inset_0_-10px_10px_rgba(16,185,129,0.25)]",
            // Active - dark mode
            "dark:group-active:shadow-[inset_0_-10px_10px_rgba(167,139,250,0.25)]",
          )}
        />

        {/* backdrop */}
        <div
          className={cn(
            "absolute -z-20 [border-radius:var(--radius)] [inset:var(--cut)]",
            // Light mode backdrop
            "bg-white/95",
            // Dark mode backdrop
            "dark:bg-purple-900/95",
          )}
        />
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };
