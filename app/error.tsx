"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log error for debugging
    console.error("Application error:", error);
  }, [error]);

  const copyErrorDetails = async () => {
    const errorDetails = `Error: ${error.message}\nDigest: ${error.digest || "N/A"}\nTimestamp: ${new Date().toISOString()}`;
    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass space-y-8 p-6 text-center md:p-10">
          {/* Animated Icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-destructive/20 blur-xl" />
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle
                className="h-10 w-10 text-destructive"
                aria-hidden="true"
              />
            </div>
          </motion.div>

          {/* Error Message */}
          <div className="space-y-4">
            <motion.h1
              className="text-3xl font-bold text-destructive md:text-4xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Oops!
            </motion.h1>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold md:text-3xl">
                Something went wrong
              </h2>
              <p className="mx-auto max-w-md text-sm text-muted-foreground md:text-base">
                Don't worry, it's not your fault. An unexpected error occurred.
                Try refreshing the page or go back to continue.
              </p>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={reset}
              className="flex min-w-[140px] items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try Again
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
              className="flex min-w-[140px] items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Go Back
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Link href="/">
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Return Home
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2"
              >
                {showDetails ? "Hide" : "Show"} Error Details
              </Button>
            </div>

            {/* Error Details */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-left"
              >
                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Error Details
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyErrorDetails}
                      className="flex h-8 items-center gap-1 px-2"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" aria-hidden="true" />
                          <span className="text-xs">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" aria-hidden="true" />
                          <span className="text-xs">Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="break-all font-mono text-xs">
                      <span className="font-semibold">Message:</span>{" "}
                      {error.message}
                    </p>
                    {error.digest && (
                      <p className="break-all font-mono text-xs">
                        <span className="font-semibold">Digest:</span>{" "}
                        {error.digest}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
