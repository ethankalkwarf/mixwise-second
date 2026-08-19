"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * Ensures CSS and fonts load properly in the Capacitor webview.
 */
export function MobileStyleFix() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.backgroundColor = "#F9F7F2";
    document.body.style.color = "#2C3628";
    document.body.style.fontFamily = "var(--font-jost), system-ui, sans-serif";
    document.body.style.setProperty("-webkit-font-smoothing", "antialiased");
    document.body.style.setProperty("-moz-osx-font-smoothing", "grayscale");

    const html = document.documentElement;
    html.style.margin = "0";
    html.style.padding = "0";
    html.style.height = "100%";
    html.style.backgroundColor = "#F9F7F2";

    if (!html.style.getPropertyValue("--font-dm-serif")) {
      html.style.setProperty("--font-dm-serif", "DM Serif Display, ui-serif, serif");
    }
    if (!html.style.getPropertyValue("--font-jost")) {
      html.style.setProperty("--font-jost", "Jost, system-ui, sans-serif");
    }

    document.body.classList.add("bg-cream", "text-charcoal");
  }, []);

  return null;
}
