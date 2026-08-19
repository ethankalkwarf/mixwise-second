"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

interface MobileAppContextValue {
  moreOpen: boolean;
  openMore: () => void;
  closeMore: () => void;
  toggleMore: () => void;
}

const MobileAppContext = createContext<MobileAppContextValue | null>(null);

export function MobileAppProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const closeMore = useCallback(() => setMoreOpen(false), []);
  const openMore = useCallback(() => setMoreOpen(true), []);
  const toggleMore = useCallback(() => setMoreOpen((v) => !v), []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("mobile-sheet-open", moreOpen);
    return () => document.documentElement.classList.remove("mobile-sheet-open");
  }, [moreOpen]);

  const value = useMemo(
    () => ({ moreOpen, openMore, closeMore, toggleMore }),
    [moreOpen, openMore, closeMore, toggleMore]
  );

  return <MobileAppContext.Provider value={value}>{children}</MobileAppContext.Provider>;
}

export function useMobileApp() {
  const ctx = useContext(MobileAppContext);
  if (!ctx) {
    throw new Error("useMobileApp must be used within MobileAppProvider");
  }
  return ctx;
}

export function useMobileAppOptional() {
  return useContext(MobileAppContext);
}
