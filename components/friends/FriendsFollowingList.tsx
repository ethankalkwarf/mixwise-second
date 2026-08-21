"use client";

import { PersonRow } from "@/components/friends/PersonRow";
import type { FriendPerson } from "@/components/friends/types";

export function FriendsFollowingList({
  following,
  loading,
  onUnfollow,
  onFindPeople,
  emptyHint = "You're not following anyone yet. Invite friends or search for a username.",
}: {
  following: FriendPerson[];
  loading: boolean;
  onUnfollow: (personId: string) => void;
  onFindPeople?: () => void;
  emptyHint?: string;
}) {
  if (loading) {
    return (
      <ul className="space-y-4" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center gap-3">
            <div className="h-12 w-12 animate-pulse rounded-full bg-mist" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/3 animate-pulse rounded bg-mist" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-mist/80" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (following.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-sage">{emptyHint}</p>
        {onFindPeople && (
          <button
            type="button"
            onClick={onFindPeople}
            className="text-sm font-medium text-olive hover:text-olive-dark"
          >
            Find people →
          </button>
        )}
      </div>
    );
  }

  return (
    <ul>
      {following.map((person) => (
        <PersonRow
          key={person.id}
          person={person}
          compact
          onFollowChange={(isFollowing) => {
            if (!isFollowing) onUnfollow(person.id);
          }}
        />
      ))}
    </ul>
  );
}
