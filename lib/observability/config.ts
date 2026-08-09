export function isSentryEnabled(dsn: string | undefined, environment: string | undefined): boolean {
  return Boolean(dsn && environment);
}

export function getSentryTraceSampleRate(environment: string | undefined): number {
  if (environment === "production") return 0.05;
  if (environment === "preview") return 0.01;
  return 0;
}
