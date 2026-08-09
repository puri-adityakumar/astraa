import * as Sentry from "@sentry/nextjs";

import { getSentryTraceSampleRate, isSentryEnabled } from "@/lib/observability/config";
import { sanitizeSentryBreadcrumb, sanitizeSentryEvent } from "@/lib/observability/sentry";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;

Sentry.init({
  dsn,
  enabled: isSentryEnabled(dsn, environment),
  ...(environment ? { environment } : {}),
  beforeBreadcrumb: sanitizeSentryBreadcrumb,
  beforeSend: sanitizeSentryEvent,
  enableLogs: false,
  replaysOnErrorSampleRate: 0,
  replaysSessionSampleRate: 0,
  sendDefaultPii: false,
  tracesSampleRate: getSentryTraceSampleRate(environment),
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
