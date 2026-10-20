import { tempoHostIdentity } from "tempo-sdk/nextjs";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(tempoHostIdentity(), {
    headers: {
      "cache-control": "no-store",
      "x-tempo-host-identity": "1",
    },
  });
}
