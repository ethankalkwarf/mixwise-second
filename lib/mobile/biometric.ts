/**
 * Face ID / Touch ID via @aparajita/capacitor-biometric-auth
 */

import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import {
  BiometricAuth,
  BiometryType,
} from "@aparajita/capacitor-biometric-auth";

const BIOMETRIC_ENABLED_KEY = "biometricAuthEnabled";

export async function isBiometricAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios") {
    return false;
  }

  try {
    const result = await BiometricAuth.checkBiometry();
    return result.isAvailable;
  } catch {
    return false;
  }
}

export async function isBiometricEnabled(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key: BIOMETRIC_ENABLED_KEY });
      return value === "true";
    }
    return typeof window !== "undefined" && localStorage.getItem(BIOMETRIC_ENABLED_KEY) === "true";
  } catch {
    return false;
  }
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  const value = enabled ? "true" : "false";
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key: BIOMETRIC_ENABLED_KEY, value });
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(BIOMETRIC_ENABLED_KEY, value);
  }
}

export async function authenticateWithBiometric(reason: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;

  try {
    await BiometricAuth.authenticate({
      reason,
      allowDeviceCredential: true,
    });
    return true;
  } catch {
    return false;
  }
}

export function getBiometricType(): "face" | "touch" | "none" {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios") {
    return "none";
  }
  return "face";
}

export async function getBiometricName(): Promise<string> {
  if (!Capacitor.isNativePlatform()) return "Biometric Authentication";

  try {
    const result = await BiometricAuth.checkBiometry();
    if (result.biometryType === BiometryType.faceId) return "Face ID";
    if (result.biometryType === BiometryType.touchId) return "Touch ID";
    return "Biometric Authentication";
  } catch {
    return "Face ID";
  }
}

/** @deprecated Preferences-only token storage — session lives in Supabase cookies. */
export async function storeAuthToken(_token: string): Promise<void> {}
export async function getAuthToken(): Promise<string | null> {
  return null;
}
export async function clearAuthToken(): Promise<void> {}
