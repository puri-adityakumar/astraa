"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className="flex items-center gap-1">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("text-2xl font-semibold", className)}
      >
        <span className="font-logo text-white">astraa</span>
        <span className="ml-1 font-mono text-sm text-muted-foreground">
          अस्त्र
        </span>
      </motion.div>
    </Link>
  );
}
