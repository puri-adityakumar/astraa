// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://088e07b57ecdb335e811566d71cac965@o4510567847952384.ingest.de.sentry.io/4510571667390544",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
  environment: process.env.NODE_ENV,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Never send user PII: the site promises all processing stays in the browser.
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});
