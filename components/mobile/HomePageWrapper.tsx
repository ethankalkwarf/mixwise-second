"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { MobileHomePage } from "./MobileHomePageModern";
import type { SanityCocktail } from "@/lib/sanityTypes";

interface HomePageWrapperProps {
  featuredCocktails: SanityCocktail[];
  allCocktails: SanityCocktail[];
  children: React.ReactNode; // Web version
}

export function HomePageWrapper({ featuredCocktails, allCocktails, children }: HomePageWrapperProps) {
  const [isNative, setIsNative] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Only check Capacitor after component mounts (client-side only)
    if (typeof window !== "undefined") {
      try {
        if (window.Capacitor) {
          setIsNative(Capacitor.isNativePlatform());
        } else {
          // Fallback: check user agent for iOS/Android webview
          const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
          const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
          const isAndroid = /android/i.test(ua);
          // Only set native if we're in a webview (not Safari browser)
          if ((isIOS || isAndroid) && !window.navigator.standalone && !document.referrer) {
            setIsNative(true);
          }
        }
      } catch (e) {
        console.error("Error checking native platform:", e);
        setIsNative(false);
      }
    }
  }, []);

  // During SSR or before mount, show web version
  if (!isMounted || !isNative) {
    return <>{children}</>;
  }

  // On native platforms, show mobile version
  return <MobileHomePage featuredCocktails={featuredCocktails} allCocktails={allCocktails} />;
}
