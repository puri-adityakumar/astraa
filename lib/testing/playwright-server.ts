const DEFAULT_BASE_URL = "http://127.0.0.1:3002";
const LOOPBACK_HOSTNAMES = new Set(["127.0.0.1", "localhost", "[::1]"]);
const BASE_URL_ERROR =
  "PLAYWRIGHT_BASE_URL must use http, an explicit port, and a loopback origin only.";

export interface PlaywrightServerEnvironment {
  readonly [key: string]: string | undefined;
  readonly CI?: string | undefined;
  readonly PLAYWRIGHT_BASE_URL?: string | undefined;
  readonly PLAYWRIGHT_REUSE_EXISTING_SERVER?: string | undefined;
}

export interface PlaywrightServerSettings {
  baseURL: string;
  command: string;
  hostname: string;
  port: number;
  reuseExistingServer: boolean;
}

/**
 * Resolves the local production server that Playwright may start or probe.
 * Only allowlisted hostnames and a parsed numeric port reach the shell command.
 */
export function resolvePlaywrightServer(
  environment: Readonly<PlaywrightServerEnvironment>,
): PlaywrightServerSettings {
  const configuredURL = environment.PLAYWRIGHT_BASE_URL ?? DEFAULT_BASE_URL;
  let url: URL;

  if (/\s/.test(configuredURL)) {
    throw new Error(BASE_URL_ERROR);
  }

  try {
    url = new URL(configuredURL);
  } catch {
    throw new Error(BASE_URL_ERROR);
  }

  const port = Number(url.port);
  if (
    url.protocol !== "http:" ||
    !LOOPBACK_HOSTNAMES.has(url.hostname) ||
    url.username !== "" ||
    url.password !== "" ||
    url.pathname !== "/" ||
    url.search !== "" ||
    url.hash !== "" ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65_535
  ) {
    throw new Error(BASE_URL_ERROR);
  }

  const hostname = url.hostname === "[::1]" ? "::1" : url.hostname;
  const baseURL = url.origin;

  return {
    baseURL,
    command: `npm start -- --hostname ${hostname} --port ${port}`,
    hostname,
    port,
    reuseExistingServer: !environment.CI && environment.PLAYWRIGHT_REUSE_EXISTING_SERVER === "true",
  };
}
