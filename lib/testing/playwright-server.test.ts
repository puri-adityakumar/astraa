import { describe, expect, it } from "vitest";

import { resolvePlaywrightServer, type PlaywrightServerEnvironment } from "./playwright-server";

describe("resolvePlaywrightServer", () => {
  it.each([
    {
      configuredURL: undefined,
      expectedBaseURL: "http://127.0.0.1:3002",
      expectedHostname: "127.0.0.1",
      expectedPort: 3002,
    },
    {
      configuredURL: "http://127.0.0.1:4100",
      expectedBaseURL: "http://127.0.0.1:4100",
      expectedHostname: "127.0.0.1",
      expectedPort: 4100,
    },
    {
      configuredURL: "http://localhost:4200/",
      expectedBaseURL: "http://localhost:4200",
      expectedHostname: "localhost",
      expectedPort: 4200,
    },
    {
      configuredURL: "http://[::1]:4300",
      expectedBaseURL: "http://[::1]:4300",
      expectedHostname: "::1",
      expectedPort: 4300,
    },
  ])(
    "keeps the base origin, hostname, port, and command aligned for $expectedBaseURL",
    ({ configuredURL, expectedBaseURL, expectedHostname, expectedPort }) => {
      const settings = resolvePlaywrightServer({
        PLAYWRIGHT_BASE_URL: configuredURL,
      });

      expect(settings).toMatchObject({
        baseURL: expectedBaseURL,
        hostname: expectedHostname,
        port: expectedPort,
        command: `npm start -- --hostname ${expectedHostname} --port ${expectedPort}`,
      });

      const parsedOrigin = new URL(settings.baseURL);
      expect(Number(parsedOrigin.port)).toBe(settings.port);
      expect(parsedOrigin.hostname.replace(/^\[|\]$/g, "")).toBe(settings.hostname);
    },
  );

  it.each([
    "not-a-url",
    "https://127.0.0.1:3002",
    "http://example.com:3002",
    "http://192.168.1.10:3002",
    "http://127.0.0.2:3002",
    "http://user@localhost:3002",
    "http://user:password@localhost:3002",
    "http://localhost:3002/nested",
    "http://localhost:3002?probe=true",
    "http://localhost:3002#probe",
    "http://localhost",
    "http://localhost:0",
    "http://localhost:65536",
    "http://localhost:not-a-port",
    "http://localhost:3002/;touch-pwned",
    "http://localhost:3002/%0a--hostname%200.0.0.0",
    "http://localhost:3002\n--hostname 0.0.0.0",
    " http://localhost:3002",
  ])("rejects unsafe or malformed URL %j", (configuredURL) => {
    expect(() => resolvePlaywrightServer({ PLAYWRIGHT_BASE_URL: configuredURL })).toThrowError(
      "PLAYWRIGHT_BASE_URL must use http, an explicit port, and a loopback origin only.",
    );
  });

  it.each([
    { environment: {}, expected: false },
    {
      environment: { PLAYWRIGHT_REUSE_EXISTING_SERVER: "false" },
      expected: false,
    },
    {
      environment: { PLAYWRIGHT_REUSE_EXISTING_SERVER: "true" },
      expected: true,
    },
    {
      environment: { PLAYWRIGHT_REUSE_EXISTING_SERVER: "TRUE" },
      expected: false,
    },
    {
      environment: { CI: "1", PLAYWRIGHT_REUSE_EXISTING_SERVER: "true" },
      expected: false,
    },
    {
      environment: { CI: "false", PLAYWRIGHT_REUSE_EXISTING_SERVER: "true" },
      expected: false,
    },
  ] satisfies { environment: PlaywrightServerEnvironment; expected: boolean }[])(
    "resolves reuseExistingServer=$expected for $environment",
    ({ environment, expected }) => {
      expect(resolvePlaywrightServer(environment).reuseExistingServer).toBe(expected);
    },
  );
});
