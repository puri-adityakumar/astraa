"use client"

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { isSensitiveReplayRoute } from "@/lib/privacy/sensitive-replay-routes";

type StoppableReplay = {
  name: string;
  stop?(options?: { reason?: string; forceflush?: boolean }): Promise<void>;
};

const RETRY_INTERVAL_MS = 250;
const MAX_ATTEMPTS = 8;

/**
 * Turns session replay off while a secret-handling tool is on screen (#96):
 * stopped replays discard their buffer and cannot be re-attached by a later
 * error, and recording is never restarted afterwards — the SDK's own sampling
 * decision from page load stands. The short retry covers integrations that
 * attach after init (see the deferred replay import), not a missing one.
 */
export function ReplayGuard(): null {
  const pathname = usePathname();

  useEffect(() => {
    if (!isSensitiveReplayRoute(pathname)) {
      return;
    }

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const stopReplay = () => {
      if (cancelled) {
        return;
      }
      const replay: StoppableReplay | undefined =
        Sentry.getClient()?.getIntegrationByName("Replay");
      if (!replay) {
        attempts += 1;
        if (attempts < MAX_ATTEMPTS) {
          timer = setTimeout(stopReplay, RETRY_INTERVAL_MS);
        }
        return;
      }
      void replay.stop?.({ reason: "sensitive-route" });
    };

    stopReplay();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [pathname]);

  return null;
}
