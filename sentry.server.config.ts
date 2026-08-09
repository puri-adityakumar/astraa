import * as Sentry from "@sentry/nextjs";

import { getSentryTraceSampleRate, isSentryEnabled } from "@/lib/observability/config";
import { sanitizeSentryBreadcrumb, sanitizeSentryEvent } from "@/lib/observability/sentry";

const dsn = process.env.SENTRY_DSN;
const environment = process.env.SENTRY_ENVIRONMENT;

Sentry.init({
  dsn,
  enabled: isSentryEnabled(dsn, environment),
  ...(environment ? { environment } : {}),
  beforeBreadcrumb: sanitizeSentryBreadcrumb,
  beforeSend: sanitizeSentryEvent,
  enableLogs: false,
  sendDefaultPii: false,
  tracesSampleRate: getSentryTraceSampleRate(environment),
});
