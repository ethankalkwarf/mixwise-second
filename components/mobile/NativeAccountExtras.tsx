"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { NotificationSettings } from "@/components/mobile/NotificationSettings";

/** Native-only settings surfaced on the account page. */
export function NativeAccountExtras() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  if (!isNative) {
    return null;
  }

  return (
    <section className="section-botanical">
      <NotificationSettings />
    </section>
  );
}
