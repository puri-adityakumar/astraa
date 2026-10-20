"use client";

import dynamic from "next/dynamic";

const TempoHost = dynamic(() => import("../../.tempo/tempo-host"), {
  ssr: false,
});

export default function Page() {
  return <TempoHost />;
}
