/**
 * Local Notifications Service
 * 
 * Handles scheduling and managing local notifications for drink of the day.
 * Allows users to set custom notification time (defaults to 5pm).
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { debugLog } from "@/lib/debugLog";

const NOTIFICATION_ID = 1001; // Fixed ID for drink of the day notification
const PREFERENCE_KEY = 'drinkNotificationTime';
const NOTIFICATION_ENABLED_KEY = 'drinkNotificationEnabled';
const DEFAULT_HOUR = 17; // 5pm
const DEFAULT_MINUTE = 0;

export interface NotificationTime {
  hour: number; // 0-23
  minute: number; // 0-59
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('[Notifications] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export async function isNotificationEnabled(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const value = localStorage.getItem(NOTIFICATION_ENABLED_KEY);
    return value === 'true';
  } catch (error) {
    return false;
  }
}

/**
 * Set notification enabled/disabled
 */
export async function setNotificationEnabled(enabled: boolean): Promise<void> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.setItem(NOTIFICATION_ENABLED_KEY, enabled ? 'true' : 'false');
    
    if (!enabled) {
      // Cancel notifications when disabled
      await cancelDrinkNotification();
    } else {
      // Schedule when enabled
      const time = await getNotificationTime();
      await scheduleDrinkNotification(time.hour, time.minute);
    }
  } catch (error) {
    console.error('[Notifications] Error setting enabled:', error);
  }
}

/**
 * Get user's notification time preference
 */
export async function getNotificationTime(): Promise<NotificationTime> {
  try {
    // Try Capacitor Preferences first (native storage)
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key: PREFERENCE_KEY });
      if (value) {
        return JSON.parse(value);
      }
    }

    // Fall back to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(PREFERENCE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }

    // Default to 5pm
    return { hour: DEFAULT_HOUR, minute: DEFAULT_MINUTE };
  } catch (error) {
    console.error('[Notifications] Error getting notification time:', error);
    return { hour: DEFAULT_HOUR, minute: DEFAULT_MINUTE };
  }
}

/**
 * Set user's notification time preference
 */
export async function setNotificationTime(time: NotificationTime): Promise<void> {
  try {
    const timeStr = JSON.stringify(time);

    // Save to Capacitor Preferences (native storage)
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key: PREFERENCE_KEY, value: timeStr });
    }

    // Also save to localStorage as backup
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(PREFERENCE_KEY, timeStr);
    }

    // Schedule notification with new time
    const enabled = await isNotificationEnabled();
    if (enabled) {
      await scheduleDrinkNotification(time.hour, time.minute);
    }
  } catch (error) {
    console.error('[Notifications] Error setting notification time:', error);
  }
}

/**
 * Cancel existing drink of the day notification
 */
export async function cancelDrinkNotification(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: NOTIFICATION_ID }]
    });
    debugLog('[Notifications] Cancelled drink notification');
  } catch (error) {
    console.error('[Notifications] Error cancelling notification:', error);
  }
}

/**
 * Schedule daily drink of the day notification
 */
export async function scheduleDrinkNotification(hour: number, minute: number): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.warn('[Notifications] Not native platform, skipping scheduling');
    return;
  }

  try {
    // Check permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('[Notifications] Permission not granted');
      return;
    }

    // Cancel existing notification
    await cancelDrinkNotification();

    // Schedule new notification
    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIFICATION_ID,
          title: 'Drink of the Day 🍹',
          body: 'Check out today\'s featured cocktail!',
          schedule: {
            on: { hour, minute },
            every: 'day',
            allowWhileIdle: true, // iOS will use best effort
          },
          sound: 'default',
          attachments: undefined,
          actionTypeId: '',
          extra: {
            type: 'drink_of_the_day',
          },
        },
      ],
    });

    debugLog(`[Notifications] Scheduled daily notification for ${hour}:${minute.toString().padStart(2, '0')}`);
  } catch (error) {
    console.error('[Notifications] Error scheduling notification:', error);
  }
}

/**
 * Initialize notifications on app startup
 */
export async function initializeNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const enabled = await isNotificationEnabled();
    if (!enabled) {
      return;
    }

    const time = await getNotificationTime();
    await scheduleDrinkNotification(time.hour, time.minute);
  } catch (error) {
    console.error('[Notifications] Error initializing notifications:', error);
  }
}

/**
 * Get pending notifications (for debugging)
 */
export async function getPendingNotifications() {
  if (!Capacitor.isNativePlatform()) {
    return { notifications: [] };
  }

  try {
    return await LocalNotifications.getPending();
  } catch (error) {
    console.error('[Notifications] Error getting pending notifications:', error);
    return { notifications: [] };
  }
}
