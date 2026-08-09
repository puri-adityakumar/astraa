import "server-only";

import { cache } from "react";

import { requestContributors } from "./contributors-service";
import type { Contributor } from "./contributors-service";

export type { Contributor } from "./contributors-service";

export const getContributors = cache(async (): Promise<Contributor[]> => {
  if (process.env.ASTRAA_E2E_FIXTURES === "true") return [];
  return requestContributors();
});
