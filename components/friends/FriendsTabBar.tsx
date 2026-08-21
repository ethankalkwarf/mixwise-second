"use client";

import type { FriendsTab } from "@/components/friends/types";

export function FriendsTabBar({
  tab,
  onChange,
  followingCount,
  followingLoading,
  variant = "web",
}: {
  tab: FriendsTab;
  onChange: (tab: FriendsTab) => void;
  followingCount: number;
  followingLoading: boolean;
  variant?: "web" | "native";
}) {
  const tabs: { id: FriendsTab; label: string }[] = [
    { id: "activity", label: "Activity" },
    { id: "find", label: "People" },
    { id: "following", label: "Following" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Friends sections"
      className={
        variant === "native"
          ? "flex gap-1 rounded-2xl bg-mist/50 p-1"
          : "flex gap-1 rounded-2xl border border-mist bg-white p-1"
      }
    >
      {tabs.map((t) => {
        const active = tab === t.id;
        const count =
          t.id === "following" && !followingLoading ? followingCount : null;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors outline-none focus:outline-none focus-visible:outline-none ${
              active
                ? variant === "native"
                  ? "bg-white text-forest shadow-sm"
                  : "bg-forest text-cream"
                : "text-sage active:bg-white/60 hover:text-forest"
            }`}
          >
            {t.label}
            {count != null && count > 0 ? (
              <span className={`ml-1 tabular-nums ${active ? "opacity-80" : ""}`}>
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
