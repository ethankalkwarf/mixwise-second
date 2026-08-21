"use client";

import { useState, useEffect } from "react";
import { BellIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Capacitor } from "@capacitor/core";
import {
  getNotificationTime,
  setNotificationTime,
  isNotificationEnabled,
  setNotificationEnabled,
  requestNotificationPermissions,
  type NotificationTime,
} from "@/lib/mobile/notifications";

export function NotificationSettings({ framed = true }: { framed?: boolean }) {
  const [isNative, setIsNative] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState<NotificationTime>({ hour: 17, minute: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  useEffect(() => {
    if (!isNative) return;

    const loadPreferences = async () => {
      try {
        const isEnabled = await isNotificationEnabled();
        const notificationTime = await getNotificationTime();
        setEnabled(isEnabled);
        setTime(notificationTime);
      } catch (error) {
        console.error("[NotificationSettings] Error loading preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadPreferences();
  }, [isNative]);

  const handleToggle = async () => {
    const newEnabled = !enabled;

    if (newEnabled) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        alert("Please enable notifications in Settings to receive daily cocktail notifications.");
        return;
      }
    }

    setSaving(true);
    try {
      await setNotificationEnabled(newEnabled);
      setEnabled(newEnabled);
    } catch (error) {
      console.error("[NotificationSettings] Error toggling notifications:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = async (newTime: NotificationTime) => {
    setTime(newTime);
    setSaving(true);

    try {
      await setNotificationTime(newTime);
    } catch (error) {
      console.error("[NotificationSettings] Error setting notification time:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (hour: number, minute: number): string => {
    const h = hour % 12 || 12;
    const m = minute.toString().padStart(2, "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${h}:${m} ${ampm}`;
  };

  if (!isNative) {
    return null;
  }

  if (loading) {
    const loadingBody = (
      <div className="space-y-3 py-2">
        <div className="h-14 animate-pulse rounded-xl bg-mist/60" />
      </div>
    );
    return framed ? (
      <div className="rounded-3xl bg-white p-4 shadow-sm">{loadingBody}</div>
    ) : (
      loadingBody
    );
  }

  const body = (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <BellIcon className="w-5 h-5 shrink-0 text-sage" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-forest">Daily Cocktail Notifications</h3>
          <p className="text-sm text-sage">Daily reminder with today&apos;s featured recipe</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
            disabled={saving}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-mist peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-terracotta rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
        </label>
      </div>

      {enabled && (
        <div className="flex items-center gap-4 border-t border-mist/80 pt-4 pl-9">
          <ClockIcon className="w-5 h-5 shrink-0 text-sage" />
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-forest">
              Notification Time
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={`${time.hour.toString().padStart(2, "0")}:${time.minute.toString().padStart(2, "0")}`}
                onChange={(e) => {
                  const [hour, minute] = e.target.value.split(":").map(Number);
                  void handleTimeChange({ hour, minute });
                }}
                disabled={saving}
                className="input-botanical w-40"
              />
              <span className="text-sm text-sage">
                {formatTime(time.hour, time.minute)}
              </span>
            </div>
            <p className="mt-1 text-xs text-sage">
              Default: 5:00 PM. Change anytime to adjust your notification time.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return framed ? (
    <div className="rounded-3xl bg-white p-4 shadow-sm">{body}</div>
  ) : (
    body
  );
}
