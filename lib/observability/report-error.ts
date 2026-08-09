import * as Sentry from "@sentry/nextjs";

import { logError } from "@/lib/error-handler";

export function reportError(error: unknown, context: Record<string, unknown> = {}): void {
  const diagnostic = logError(error, context);
  const capturedError = new Error(diagnostic.message);
  capturedError.name = diagnostic.name;
  if (diagnostic.stack) capturedError.stack = diagnostic.stack;

  Sentry.captureException(capturedError, {
    contexts: { astraa: diagnostic.context },
    tags: { errorCode: diagnostic.code },
  });
}
