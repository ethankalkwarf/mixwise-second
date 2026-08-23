"use client";

import { useEffect } from "react";
import { useUser } from "@/components/auth/UserProvider";
import { mergeEngagementOnLogin, setEngagementSyncUserId } from "@/lib/engagement";

/** Merges local pour/checklist state with the account on sign-in. */
export function EngagementSync() {
  const { user, isAuthenticated } = useUser();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setEngagementSyncUserId(null);
      return;
    }

    setEngagementSyncUserId(user.id);
    void mergeEngagementOnLogin(user.id);
  }, [isAuthenticated, user?.id]);

  return null;
}
