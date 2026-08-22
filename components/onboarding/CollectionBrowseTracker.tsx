"use client";

import { useEffect } from "react";
import { markCollectionBrowsed } from "@/lib/onboardingChecklist";

/** Marks the onboarding checklist “browse a collection” step when mounted. */
export function CollectionBrowseTracker() {
  useEffect(() => {
    markCollectionBrowsed();
  }, []);
  return null;
}
