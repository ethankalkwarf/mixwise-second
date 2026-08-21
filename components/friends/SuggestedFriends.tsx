"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { FollowButton } from "@/components/bar/FollowButton";
import { AppLink } from "@/components/mobile/AppLink";

type Person = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  barPath: string | null;
  tier?: { id: string; name: string };
  reason?: string;
};

export function SuggestedFriends({ onFollowed }: { onFollowed?: () => void }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/friends/suggestions");
        const data = await res.json();
        if (!cancelled && res.ok) setPeople(data.people ?? []);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-mist" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-1/3 animate-pulse rounded bg-mist" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-mist/70" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <p className="text-sm text-sage">
        Suggestions appear as more people enable public bars and follow each other.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-mist/80">
      {people.map((person) => {
        const name = person.display_name || person.username || "Bartender";
        return (
          <li key={person.id} className="flex items-center justify-between gap-3 py-3">
            <AppLink
              href={person.barPath || "/friends"}
              className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-90"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-olive/15">
                {person.avatar_url ? (
                  <Image
                    src={person.avatar_url}
                    alt=""
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="h-6 w-6 text-olive" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-forest">{name}</p>
                <p className="truncate text-sm text-sage">
                  {person.reason || (person.tier ? person.tier.name : "")}
                </p>
              </div>
            </AppLink>
            <FollowButton
              userId={person.id}
              compact
              onChange={(following) => {
                if (following) {
                  setPeople((list) => list.filter((p) => p.id !== person.id));
                  onFollowed?.();
                }
              }}
            />
          </li>
        );
      })}
    </ul>
  );
}
