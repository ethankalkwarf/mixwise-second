"use client";

import { useEffect, useState } from "react";
import { FingerPrintIcon } from "@heroicons/react/24/outline";
import { Capacitor } from "@capacitor/core";
import {
  authenticateWithBiometric,
  getBiometricName,
  isBiometricAvailable,
  isBiometricEnabled,
  setBiometricEnabled,
} from "@/lib/mobile/biometric";

export function BiometricSettings() {
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState("Face ID");

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios") {
      setLoading(false);
      return;
    }

    void (async () => {
      const [avail, on, name] = await Promise.all([
        isBiometricAvailable(),
        isBiometricEnabled(),
        getBiometricName(),
      ]);
      setAvailable(avail);
      setEnabled(on);
      setLabel(name);
      setLoading(false);
    })();
  }, []);

  if (loading || !available) return null;

  const handleToggle = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (!enabled) {
        const ok = await authenticateWithBiometric(`Enable ${label}`);
        if (!ok) return;
        await setBiometricEnabled(true);
        setEnabled(true);
      } else {
        await setBiometricEnabled(false);
        setEnabled(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FingerPrintIcon className="h-5 w-5 text-sage" />
          <div>
            <p className="font-medium text-forest">{label} lock</p>
            <p className="text-xs text-sage">Require {label} when reopening the app</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={saving}
          onClick={handleToggle}
          className={`relative h-7 w-12 rounded-full transition-colors ${
            enabled ? "bg-terracotta" : "bg-mist"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
