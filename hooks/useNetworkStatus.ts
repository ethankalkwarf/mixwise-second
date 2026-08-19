"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Network, type ConnectionStatus } from "@capacitor/network";

export function useNetworkStatus() {
  const [online, setOnline] = useState(true);
  const [native, setNative] = useState(false);

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    setNative(isNative);

    if (!isNative) {
      const sync = () => setOnline(navigator.onLine);
      sync();
      window.addEventListener("online", sync);
      window.addEventListener("offline", sync);
      return () => {
        window.removeEventListener("online", sync);
        window.removeEventListener("offline", sync);
      };
    }

    let remove: (() => void) | undefined;

    void Network.getStatus().then((status: ConnectionStatus) => {
      setOnline(status.connected);
    });

    void Network.addListener("networkStatusChange", (status: ConnectionStatus) => {
      setOnline(status.connected);
    }).then((handle) => {
      remove = () => handle.remove();
    });

    return () => {
      remove?.();
    };
  }, []);

  return { online, native };
}
