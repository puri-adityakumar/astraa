"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";

import { createSafeErrorReport, getUserFriendlyError } from "@/lib/error-handler";
import { reportError } from "@/lib/observability/report-error";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ROUTE_TEMPLATE = "/[global-error]";

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const publicError = getUserFriendlyError(error);
  const safeReport = useMemo(
    () => createSafeErrorReport(error, error.digest, ROUTE_TEMPLATE),
    [error],
  );

  useEffect(() => {
    reportError(error, {
      errorCode: publicError.code,
      operation: "app.global-error-boundary",
      routeTemplate: ROUTE_TEMPLATE,
      ...(error.digest ? { digest: error.digest } : {}),
    });
    headingRef.current?.focus();
  }, [error, publicError.code]);

  return (
    <html lang="en">
      <body>
        <main
          role="alert"
          aria-describedby="global-error-description"
          style={{
            alignItems: "center",
            display: "flex",
            fontFamily: "system-ui, sans-serif",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "24px",
          }}
        >
          <div style={{ maxWidth: "560px", textAlign: "center" }}>
            <h1 ref={headingRef} tabIndex={-1}>
              {publicError.title}
            </h1>
            <p id="global-error-description">{publicError.message}</p>
            <p>
              Support code: <code>{safeReport.code}</code>
              {safeReport.digest ? (
                <>
                  {" "}
                  · Digest: <code>{safeReport.digest}</code>
                </>
              ) : null}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button type="button" onClick={reset}>
                Try again
              </button>
              <Link href="/">Return home</Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
