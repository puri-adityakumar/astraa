"use client";

import { useContributors } from "./use-contributors";
import { ContributeHero } from "./contribute-hero";
import { TopContributors } from "./top-contributors";
import { GettingStartedSteps } from "./getting-started-steps";
import { SponsorCard } from "./sponsor-card";

export function ContributeClient() {
  const contributors = useContributors();

  return (
    <div className="container max-w-5xl pt-24 pb-12 space-y-16">
      <ContributeHero contributorCount={contributors.length} />
      <TopContributors contributors={contributors} />
      <GettingStartedSteps />
      <SponsorCard />
    </div>
  );
}
