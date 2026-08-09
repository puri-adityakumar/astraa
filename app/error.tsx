"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Check, Copy, Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useReducedMotion } from "@/lib/animations/hooks";
import {
  createSafeErrorReport,
  formatSafeErrorReport,
  getUserFriendlyError,
  logError,
} from "@/lib/error-handler";
import { reportError } from "@/lib/observability/report-error";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ROUTE_TEMPLATE = "/[app-route]";

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const publicError = getUserFriendlyError(error);
  const safeReport = useMemo(
    () => createSafeErrorReport(error, error.digest, ROUTE_TEMPLATE),
    [error],
  );

  useEffect(() => {
    reportError(error, {
      errorCode: publicError.code,
      operation: "app.error-boundary",
      routeTemplate: ROUTE_TEMPLATE,
      ...(error.digest ? { digest: error.digest } : {}),
    });
    headingRef.current?.focus();
  }, [error, publicError.code]);

  const copyErrorDetails = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(formatSafeErrorReport(safeReport));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch (copyError) {
      logError(copyError, {
        errorCode: "CLIPBOARD_WRITE_FAILED",
        operation: "app.error-boundary.copy-report",
        routeTemplate: ROUTE_TEMPLATE,
      });
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
        className="w-full max-w-2xl"
      >
        <Card
          className="glass space-y-8 p-6 text-center md:p-10"
          role="alert"
          aria-describedby="error-boundary-description"
        >
          <motion.div
            animate={shouldReduceMotion ? {} : { scale: [1, 1.08, 1] }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 1.5, ease: "easeInOut", repeat: Infinity }
            }
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-destructive/20 blur-xl" />
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />
            </div>
          </motion.div>

          <div className="space-y-4">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-3xl font-bold text-destructive outline-none md:text-4xl"
            >
              {publicError.title}
            </h1>
            <p
              id="error-boundary-description"
              className="mx-auto max-w-md text-sm text-muted-foreground md:text-base"
            >
              {publicError.message}
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={reset} className="flex min-w-[140px] items-center gap-2">
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

          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="ghost" size="sm">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Return Home
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails((visible) => !visible)}
                aria-expanded={showDetails}
                aria-controls="safe-error-details"
              >
                {showDetails ? "Hide" : "Show"} Error Details
              </Button>
            </div>

            {showDetails && (
              <div
                id="safe-error-details"
                className="space-y-2 rounded-lg bg-muted/50 p-4 text-left"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Safe support details
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void copyErrorDetails()}
                    className="flex h-8 items-center gap-1 px-2"
                    aria-label="Copy safe error details"
                  >
                    {copied ? (
                      <Check className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3 w-3" aria-hidden="true" />
                    )}
                    <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
                  </Button>
                </div>
                <dl className="space-y-1 font-mono text-xs">
                  <div>
                    <dt className="inline font-semibold">Code: </dt>
                    <dd className="inline">{safeReport.code}</dd>
                  </div>
                  {safeReport.digest && (
                    <div>
                      <dt className="inline font-semibold">Digest: </dt>
                      <dd className="inline break-all">{safeReport.digest}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="inline font-semibold">Timestamp: </dt>
                    <dd className="inline">{safeReport.timestamp}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
