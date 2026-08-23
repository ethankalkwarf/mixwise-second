"use client";

import { GettingStartedChecklist } from "@/components/onboarding/GettingStartedChecklist";
import { PourStreakChip } from "@/components/mobile/PourStreakChip";
import { LearnProgressBoundary } from "@/components/learn/LearnProgressBoundary";

function EngagementBlock() {
  return (
    <>
      <PourStreakChip variant="dark" />
      <LearnProgressBoundary>
        <GettingStartedChecklist compact />
      </LearnProgressBoundary>
    </>
  );
}

/** Checklist + streak on mobile web home (below hero). */
export function HomeEngagementStrip() {
  return (
    <div className="mb-10 space-y-4 lg:hidden">
      <EngagementBlock />
    </div>
  );
}

/** Checklist + streak in the dashboard sidebar on desktop. */
export function DashboardEngagementSidebar() {
  return (
    <div className="hidden space-y-4 lg:block">
      <EngagementBlock />
    </div>
  );
}
