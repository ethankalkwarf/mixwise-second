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

export function NotificationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState<NotificationTime>({ hour: 17, minute: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Only show on native platforms
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const isEnabled = await isNotificationEnabled();
        const notificationTime = await getNotificationTime();

        setEnabled(isEnabled);
        setTime(notificationTime);
      } catch (error) {
        console.error('[NotificationSettings] Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleToggle = async () => {
    const newEnabled = !enabled;

    // Request permissions if enabling
    if (newEnabled) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        alert('Please enable notifications in Settings to receive daily cocktail notifications.');
        return;
      }
    }

    setSaving(true);
    try {
      await setNotificationEnabled(newEnabled);
      setEnabled(newEnabled);
    } catch (error) {
      console.error('[NotificationSettings] Error toggling notifications:', error);
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
      console.error('[NotificationSettings] Error setting notification time:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (hour: number, minute: number): string => {
    const h = hour % 12 || 12;
    const m = minute.toString().padStart(2, '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${h}:${m} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <BellIcon className="w-6 h-6 text-sage" />
          <div className="flex-1">
            <h3 className="font-semibold text-forest">Daily Cocktail Notifications</h3>
            <p className="text-sm text-sage">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-4">
        <BellIcon className="w-6 h-6 text-sage" />
        <div className="flex-1">
          <h3 className="font-semibold text-forest">Daily Cocktail Notifications</h3>
          <p className="text-sm text-sage">Get notified of the drink of the day</p>
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
        <div className="flex items-center gap-4 pl-10 border-t border-mist pt-4">
          <ClockIcon className="w-5 h-5 text-sage" />
          <div className="flex-1">
            <label className="text-sm font-medium text-forest block mb-2">
              Notification Time
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={`${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`}
                onChange={(e) => {
                  const [hour, minute] = e.target.value.split(':').map(Number);
                  handleTimeChange({ hour, minute });
                }}
                disabled={saving}
                className="input-botanical w-40"
              />
              <span className="text-sm text-sage">
                {formatTime(time.hour, time.minute)}
              </span>
            </div>
            <p className="text-xs text-sage mt-1">
              Default: 5:00 PM. Change anytime to adjust your notification time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
