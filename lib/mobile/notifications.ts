/**
 * Local Notifications Service
 *
 * Pre-schedules Drink of the Day reminders for the next 30 days with copy
 * tied to each day's locked recipe (same source as the website).
 */

import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Preferences } from "@capacitor/preferences";
import { debugLog } from "@/lib/debugLog";
import { requestInAppNavigation } from "@/lib/mobile/deepLinks";
import {
  buildDailyNotificationCopy,
  type CabinetNotificationContext,
  type DailyDrinkContext,
} from "@/lib/mobile/dailyNotificationCopy";
import { getCurrentLocalDateString } from "@/lib/dailyCocktail";
import { getMixCocktailsClient } from "@/lib/cocktails";
import { getMixMatchGroups } from "@/lib/mixMatching";

const BAR_STORAGE_KEY = "mixwise-bar-inventory";

const NOTIFICATION_ID_BASE = 1001;
const FORECAST_DAYS = 30;
const PREFERENCE_KEY = "drinkNotificationTime";
const NOTIFICATION_ENABLED_KEY = "drinkNotificationEnabled";
const LAST_SCHEDULED_DATE_KEY = "drinkNotificationScheduledDate";
const DEFAULT_HOUR = 17;
const DEFAULT_MINUTE = 0;

export interface NotificationTime {
  hour: number;
  minute: number;
}

type DailyForecastItem = DailyDrinkContext & { dateKey: string };

async function getCabinetContext(drink: DailyDrinkContext): Promise<CabinetNotificationContext> {
  if (typeof window === "undefined") return {};

  let barIds: string[] = [];
  try {
    const raw = localStorage.getItem(BAR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) barIds = parsed.map(String);
    }
  } catch {
    return {};
  }

  if (barIds.length === 0) return {};

  try {
    const cocktails = await getMixCocktailsClient();
    if (!cocktails.length) return { cabinetReadyCount: 0 };

    const { ready } = getMixMatchGroups({
      cocktails,
      ownedIngredientIds: barIds,
      stapleIngredientIds: ["ice", "water"],
    });

    return {
      cabinetReadyCount: ready.length,
      canMakeTonight: ready.some((match) => match.cocktail.slug === drink.slug),
    };
  } catch {
    return {};
  }
}

async function fetchDailyForecast(days = FORECAST_DAYS): Promise<DailyForecastItem[]> {
  try {
    const res = await fetch(`/api/daily-cocktail?days=${days}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: DailyForecastItem[] };
    if (!Array.isArray(data.items)) return [];
    return data.items.filter((item) => item?.slug && item?.name && item?.dateKey);
  } catch (error) {
    console.error("[Notifications] Failed to fetch daily cocktail forecast:", error);
    return [];
  }
}

async function getLastScheduledDate(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { value } = await Preferences.get({ key: LAST_SCHEDULED_DATE_KEY });
    return value || null;
  } catch {
    return null;
  }
}

async function setLastScheduledDate(dateKey: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Preferences.set({ key: LAST_SCHEDULED_DATE_KEY, value: dateKey });
  } catch {
    /* ignore */
  }
}

function notificationIds(): Array<{ id: number }> {
  return Array.from({ length: FORECAST_DAYS }, (_, i) => ({ id: NOTIFICATION_ID_BASE + i }));
}

function hrefForDrinkNotification(extra: Record<string, unknown> | undefined): string {
  const slug = typeof extra?.slug === "string" ? extra.slug.trim() : "";
  if (slug && /^[a-z0-9-]+$/i.test(slug)) {
    return `/cocktails/${encodeURIComponent(slug)}?daily=true`;
  }
  return "/cocktail-of-the-day";
}

function scheduleDateForDay(dateKey: string, hour: number, minute: number): Date | null {
  const parts = dateKey.split("-").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const [year, month, day] = parts as [number, number, number];
  const at = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (Number.isNaN(at.getTime())) return null;
  return at;
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
    return result.display === "granted";
  } catch (error) {
    console.error("[Notifications] Error requesting permissions:", error);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export async function isNotificationEnabled(): Promise<boolean> {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }

  try {
    const value = localStorage.getItem(NOTIFICATION_ENABLED_KEY);
    return value === "true";
  } catch (error) {
    return false;
  }
}

/**
 * Set notification enabled/disabled
 */
export async function setNotificationEnabled(enabled: boolean): Promise<void> {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    localStorage.setItem(NOTIFICATION_ENABLED_KEY, enabled ? "true" : "false");

    if (!enabled) {
      await cancelDrinkNotification();
    } else {
      const time = await getNotificationTime();
      await scheduleDrinkNotification(time.hour, time.minute);
    }
  } catch (error) {
    console.error("[Notifications] Error setting enabled:", error);
  }
}

/**
 * Get user's notification time preference
 */
export async function getNotificationTime(): Promise<NotificationTime> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key: PREFERENCE_KEY });
      if (value) {
        return JSON.parse(value);
      }
    }

    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem(PREFERENCE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }

    return { hour: DEFAULT_HOUR, minute: DEFAULT_MINUTE };
  } catch (error) {
    console.error("[Notifications] Error getting notification time:", error);
    return { hour: DEFAULT_HOUR, minute: DEFAULT_MINUTE };
  }
}

/**
 * Set user's notification time preference
 */
export async function setNotificationTime(time: NotificationTime): Promise<void> {
  try {
    const timeStr = JSON.stringify(time);

    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key: PREFERENCE_KEY, value: timeStr });
    }

    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(PREFERENCE_KEY, timeStr);
    }

    const enabled = await isNotificationEnabled();
    if (enabled) {
      await scheduleDrinkNotification(time.hour, time.minute);
    }
  } catch (error) {
    console.error("[Notifications] Error setting notification time:", error);
  }
}

/**
 * Cancel existing drink of the day notifications
 */
export async function cancelDrinkNotification(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await LocalNotifications.cancel({
      notifications: notificationIds(),
    });
    debugLog("[Notifications] Cancelled drink notifications");
  } catch (error) {
    console.error("[Notifications] Error cancelling notification:", error);
  }
}

/**
 * Pre-schedule the next 30 days of Drink of the Day notifications.
 */
export async function scheduleDrinkNotification(hour: number, minute: number): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.warn("[Notifications] Not native platform, skipping scheduling");
    return;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn("[Notifications] Permission not granted");
      return;
    }

    const forecast = await fetchDailyForecast(FORECAST_DAYS);
    const today = getCurrentLocalDateString();
    const now = new Date();

    await cancelDrinkNotification();

    if (!forecast.length) {
      const fallbackAt = scheduleDateForDay(today, hour, minute);
      if (fallbackAt && fallbackAt.getTime() > now.getTime()) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: NOTIFICATION_ID_BASE,
              title: "Drink of the Day",
              body: "Open MixWise to see today's featured cocktail.",
              schedule: {
                at: fallbackAt,
                allowWhileIdle: true,
              },
              sound: "default",
              attachments: undefined,
              actionTypeId: "",
              extra: {
                type: "drink_of_the_day",
              },
            },
          ],
        });
      }
      await setLastScheduledDate(today);
      debugLog("[Notifications] Scheduled fallback daily notification");
      return;
    }

    const todayDrink = forecast.find((item) => item.dateKey === today) || forecast[0];
    const cabinet = todayDrink ? await getCabinetContext(todayDrink) : undefined;

    const notifications = forecast.flatMap((drink, index) => {
      const at = scheduleDateForDay(drink.dateKey, hour, minute);
      if (!at || at.getTime() <= now.getTime()) return [];

      const isToday = drink.dateKey === today;
      const copy = buildDailyNotificationCopy(drink, isToday ? cabinet : undefined);

      return [
        {
          id: NOTIFICATION_ID_BASE + index,
          title: copy.title,
          body: copy.body,
          schedule: {
            at,
            allowWhileIdle: true,
          },
          sound: "default" as const,
          attachments: undefined,
          actionTypeId: "",
          extra: {
            type: "drink_of_the_day",
            slug: drink.slug,
            dateKey: drink.dateKey,
          },
        },
      ];
    });

    if (notifications.length) {
      await LocalNotifications.schedule({ notifications });
    }

    await setLastScheduledDate(today);
    debugLog(
      `[Notifications] Scheduled ${notifications.length} drink notifications at ${hour}:${minute
        .toString()
        .padStart(2, "0")}`
    );
  } catch (error) {
    console.error("[Notifications] Error scheduling notification:", error);
  }
}

/**
 * Re-schedule when the app opens or returns to foreground (refreshes the 30-day window).
 */
export async function refreshDailyNotificationIfNeeded(force = false): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const enabled = await isNotificationEnabled();
  if (!enabled) return;

  const today = getCurrentLocalDateString();
  const lastScheduled = await getLastScheduledDate();
  if (!force && lastScheduled === today) {
    return;
  }

  const time = await getNotificationTime();
  await scheduleDrinkNotification(time.hour, time.minute);
}

/**
 * Initialize notifications on app startup
 */
export async function initializeNotifications(): Promise<void> {
  await refreshDailyNotificationIfNeeded(true);
}

/**
 * Register tap handlers for scheduled local notifications.
 */
export function registerNotificationDeepLinks(): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  let removeListener: (() => void) | undefined;

  void LocalNotifications.addListener("localNotificationActionPerformed", (event) => {
    const type = event.notification.extra?.type;
    if (type === "drink_of_the_day") {
      requestInAppNavigation(
        hrefForDrinkNotification(event.notification.extra),
        "notification"
      );
    }
  }).then((handle) => {
    removeListener = () => handle.remove();
  });

  return () => {
    removeListener?.();
  };
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
    console.error("[Notifications] Error getting pending notifications:", error);
    return { notifications: [] };
  }
}
