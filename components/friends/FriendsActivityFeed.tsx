"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import type { ActivityItem } from "@/lib/activity";
import { formatCocktailName } from "@/lib/formatters";
import { AppLink } from "@/components/mobile/AppLink";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function activityBody(
  item: ActivityItem,
  { capitalize, openDrinksInNewTab }: { capitalize?: boolean; openDrinksInNewTab?: boolean } = {}
): React.ReactNode {
  const verb = (word: string) => (capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word);
  const drinkLinkProps = openDrinksInNewTab
    ? ({ target: "_blank", rel: "noopener noreferrer" } as const)
    : {};

  if (item.type === "favorite" && item.favorite) {
    const drink = formatCocktailName(item.favorite.cocktail_name || "a cocktail");
    const href = item.favorite.cocktail_slug
      ? `/cocktails/${encodeURIComponent(item.favorite.cocktail_slug)}`
      : null;
    return (
      <>
        {verb("saved")}{" "}
        {href ? (
          <AppLink
            href={href}
            {...drinkLinkProps}
            className="font-semibold text-olive hover:text-olive-dark"
          >
            {drink}
          </AppLink>
        ) : (
          <span className="font-semibold text-forest">{drink}</span>
        )}
      </>
    );
  }
  if (item.type === "badge" && item.badge) {
    return (
      <>
        {verb("earned")} {item.badge.icon}{" "}
        <span className="font-semibold text-forest">{item.badge.name}</span>
      </>
    );
  }
  if (item.type === "bar_ingredient" && item.ingredient) {
    return (
      <>
        {verb("added")}{" "}
        <span className="font-semibold text-forest">
          {item.ingredient.ingredient_name || "an ingredient"}
        </span>{" "}
        to their bar
      </>
    );
  }
  return null;
}

function ActivityRow({
  item,
  variant,
}: {
  item: ActivityItem;
  variant: "friends" | "profile";
}) {
  const name = item.actor.display_name || item.actor.username || "Someone";
  const body = activityBody(item, {
    capitalize: variant === "profile",
    // Never open a new tab from the friends feed — Capacitor hands those to Safari.
    openDrinksInNewTab: false,
  });

  const nameEl = item.actor.barPath ? (
    <AppLink href={item.actor.barPath} className="font-semibold text-forest hover:opacity-90">
      {name}
    </AppLink>
  ) : (
    <span className="font-semibold text-forest">{name}</span>
  );

  const avatar = (
    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-olive/15">
      {item.actor.avatar_url ? (
        <Image src={item.actor.avatar_url} alt="" fill className="object-cover" sizes="36px" />
      ) : (
        <UserCircleIcon className="h-9 w-9 text-olive" />
      )}
    </span>
  );

  const thumb =
    item.type === "favorite" && item.favorite?.cocktail_image_url?.startsWith("http") ? (
      <AppLink
        href={
          item.favorite.cocktail_slug
            ? `/cocktails/${encodeURIComponent(item.favorite.cocktail_slug)}`
            : "#"
        }
        {...(variant === "profile"
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className={`relative shrink-0 overflow-hidden rounded-lg bg-mist ${
          variant === "profile" ? "h-10 w-10" : "h-14 w-14 rounded-xl"
        }`}
      >
        <Image
          src={item.favorite.cocktail_image_url}
          alt=""
          fill
          className="object-cover"
          sizes={variant === "profile" ? "40px" : "56px"}
        />
      </AppLink>
    ) : null;

  if (variant === "profile") {
    return (
      <li className="border-b border-mist/70 last:border-0">
        <div className="flex items-center gap-3 py-3.5">
          <p className="min-w-0 flex-1 text-sm leading-snug text-forest">{body}</p>
          <time
            dateTime={item.createdAt}
            className="shrink-0 text-xs tabular-nums text-sage"
          >
            {relativeTime(item.createdAt)}
          </time>
          {thumb}
        </div>
      </li>
    );
  }

  return (
    <li className="border-b border-mist/80 last:border-0">
      <div className="flex items-start gap-3 py-4">
        {item.actor.barPath ? (
          <AppLink href={item.actor.barPath} className="shrink-0 hover:opacity-90" aria-hidden>
            {avatar}
          </AppLink>
        ) : (
          avatar
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed text-charcoal">
            {nameEl} <span className="text-sage">{body}</span>
          </p>
          <p className="mt-1 text-xs text-sage">{relativeTime(item.createdAt)}</p>
        </div>
        {thumb}
      </div>
    </li>
  );
}

export function FriendsActivityFeed({
  userId,
  variant = "friends",
  emptyMessage,
}: {
  /** When set, loads that public bar's activity instead of the friends feed. */
  userId?: string;
  variant?: "friends" | "profile";
  emptyMessage?: string;
} = {}) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const url = userId
          ? `/api/bar/activity?userId=${encodeURIComponent(userId)}`
          : "/api/friends/activity";
        const res = await fetch(url);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Couldn't load activity");
          return;
        }
        setItems(data.items ?? []);
        setFollowingCount(data.followingCount ?? 0);
      } catch {
        if (!cancelled) setError("Couldn't load activity");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3 py-2">
            {variant === "friends" && (
              <div className="h-9 w-9 animate-pulse rounded-full bg-mist" />
            )}
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-3/4 animate-pulse rounded bg-mist" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-mist/80" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-sage">{error}</p>;
  }

  if (!userId && followingCount === 0) {
    return (
      <p className="text-sm text-sage">
        Follow friends to see when they save cocktails, earn badges, or stock their bar.
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-sage">
        {emptyMessage ||
          (userId
            ? "No recent activity yet."
            : "No recent activity from people you follow. Check back after they save a drink or add a bottle.")}
      </p>
    );
  }

  return (
    <ul className="m-0 list-none p-0">
      {items.map((item) => (
        <ActivityRow key={item.id} item={item} variant={variant} />
      ))}
    </ul>
  );
}
