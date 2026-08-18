"use client";

import { NotificationSettings } from "@/components/mobile/NotificationSettings";

/** Native-only settings surfaced on the account page. */
export function NativeAccountExtras() {
  return (
    <section className="section-botanical">
      <NotificationSettings />
    </section>
  );
}
