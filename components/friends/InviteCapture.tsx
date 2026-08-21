"use client";

import { useEffect } from "react";
import { captureInviteFromLocation } from "@/lib/invite";

/** Captures ?ref= / ?invite= / /invite/… into localStorage for post-auth follow. */
export function InviteCapture() {
  useEffect(() => {
    captureInviteFromLocation();
  }, []);
  return null;
}
