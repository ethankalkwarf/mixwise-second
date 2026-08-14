"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * MobileStyleFix
 * 
 * Ensures CSS and fonts load properly in the mobile app.
 * Fixes common styling issues in Capacitor webview.
 */
export function MobileStyleFix() {
  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Ensure body has proper base styles
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#F9F7F2'; // cream
    document.body.style.color = '#2C3628'; // charcoal
    document.body.style.fontFamily = 'var(--font-jost), system-ui, sans-serif';
    document.body.style.setProperty("-webkit-font-smoothing", "antialiased");
    document.body.style.setProperty("-moz-osx-font-smoothing", "grayscale");

    // Ensure html has proper base styles
    const html = document.documentElement;
    html.style.margin = '0';
    html.style.padding = '0';
    html.style.height = '100%';
    html.style.backgroundColor = '#F9F7F2';

    // Ensure CSS variables are set
    if (!html.style.getPropertyValue('--font-dm-serif')) {
      html.style.setProperty('--font-dm-serif', 'DM Serif Display, ui-serif, serif');
    }
    if (!html.style.getPropertyValue('--font-jost')) {
      html.style.setProperty('--font-jost', 'Jost, system-ui, sans-serif');
    }

    // Wait for fonts to load, then force a repaint
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        // Force style recalculation
        requestAnimationFrame(() => {
          // Trigger a reflow to ensure all styles are applied
          const forceReflow = document.body.offsetHeight;
          // Ensure Tailwind classes are applied
          document.body.classList.add('bg-cream', 'text-charcoal');
        });
      });
    } else {
      // Fallback if fonts API isn't available
      setTimeout(() => {
        document.body.classList.add('bg-cream', 'text-charcoal');
      }, 100);
    }

    // Add meta viewport if missing (should be in layout, but ensure it's there)
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
      document.head.appendChild(viewport);
    }

    // Ensure CSS is loaded by checking for Tailwind classes
    const checkCSS = setInterval(() => {
      const testEl = document.createElement('div');
      testEl.className = 'bg-cream';
      testEl.style.display = 'none';
      document.body.appendChild(testEl);
      const computed = window.getComputedStyle(testEl);
      const bgColor = computed.backgroundColor;
      document.body.removeChild(testEl);
      
      // If Tailwind is working, bg-cream should resolve to #F9F7F2
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        clearInterval(checkCSS);
      }
    }, 100);

    // Stop checking after 5 seconds
    setTimeout(() => clearInterval(checkCSS), 5000);
  }, []);

  return null;
}
