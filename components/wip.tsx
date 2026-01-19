"use client";

import { ReactNode, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Construction } from "lucide-react";

interface WorkInProgressProps {
  children?: ReactNode;
}

export function WorkInProgress({ children }: WorkInProgressProps) {
  const [showWip, setShowWip] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === "prod") {
      setShowWip(true);
    }
  }, []);

  if (showWip) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 text-center"
        >
          {/* Icon */}
          <Construction className="mx-auto h-16 w-16 text-primary" />

          {/* Heading with gradient */}
          <h1 className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl">
            Under Construction
          </h1>

          {/* Animated dots in mono font */}
          <p className="flex items-center justify-center gap-0 font-mono text-xl text-muted-foreground">
            work in progress
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
            >
              .
            </motion.span>
          </p>
        </motion.div>
      </div>
    );
  }

  // Default: render children (works for both SSR initial render and dev mode)
  return <>{children}</>;
}
