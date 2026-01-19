/**
 * Loading Spinner Components
 * Animated loading indicators
 */

"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useReducedMotion } from "@/lib/animations/hooks";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   * @default "md"
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Spinner variant
   * @default "spinner"
   */
  variant?: "spinner" | "dots" | "pulse" | "bars";
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Label for accessibility
   */
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  variant = "spinner",
  className,
  label = "Loading...",
}: LoadingSpinnerProps) {
  const shouldReduce = useReducedMotion();

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2.5 h-2.5",
    lg: "w-3.5 h-3.5",
    xl: "w-4 h-4",
  };

  const barSizes = {
    sm: "w-1 h-3",
    md: "w-1.5 h-5",
    lg: "w-2 h-7",
    xl: "w-2.5 h-9",
  };

  if (variant === "spinner") {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        role="status"
        aria-label={label}
      >
        <Loader2
          className={cn(
            sizeClasses[size],
            "text-primary",
            !shouldReduce && "animate-spin",
          )}
        />
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div
        className={cn("flex items-center justify-center gap-1.5", className)}
        role="status"
        aria-label={label}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(dotSizes[size], "rounded-full bg-primary")}
            animate={
              shouldReduce
                ? {}
                : {
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }
            }
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        role="status"
        aria-label={label}
      >
        <motion.div
          className={cn(sizeClasses[size], "rounded-full bg-primary")}
          animate={
            shouldReduce
              ? {}
              : {
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  if (variant === "bars") {
    return (
      <div
        className={cn("flex items-center justify-center gap-1", className)}
        role="status"
        aria-label={label}
      >
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={cn(barSizes[size], "rounded-full bg-primary")}
            animate={
              shouldReduce
                ? {}
                : {
                    scaleY: [1, 1.5, 1],
                  }
            }
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return null;
}

/**
 * Full page loading overlay
 */
export function LoadingOverlay({
  message = "Loading...",
  className,
}: {
  message?: string;
  className?: string;
}) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm",
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduce ? 0 : 0.2 }}
    >
      <LoadingSpinner size="lg" />
      {message && (
        <motion.p
          className="mt-4 text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduce ? 0 : 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

/**
 * Inline loading state
 */
export function LoadingInline({
  message = "Loading...",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-3 text-muted-foreground", className)}
    >
      <LoadingSpinner size="sm" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}
