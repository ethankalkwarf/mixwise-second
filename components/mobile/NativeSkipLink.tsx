"use client";

import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/mobile/platform";

/** Skip link is useful on web; hidden in the native tab-bar shell. */
export function NativeSkipLink() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!isNativeApp());
  }, []);

  if (!visible) return null;

  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  );
}
