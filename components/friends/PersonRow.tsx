"use client";

import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { FollowButton } from "@/components/bar/FollowButton";
import type { FriendPerson } from "@/components/friends/types";
import { optimizeAvatarUrl } from "@/lib/avatarUrl";
import { AppLink } from "@/components/mobile/AppLink";

export function PersonRow({
  person,
  onFollowChange,
  compact,
}: {
  person: FriendPerson;
  onFollowChange?: (following: boolean) => void;
  compact?: boolean;
}) {
  const name = person.display_name || person.username || "Bartender";
  const meta = [person.username ? `@${person.username}` : null, person.tier?.name ?? null]
    .filter(Boolean)
    .join(" · ");
  const size = compact ? 40 : 48;
  const avatarUrl = optimizeAvatarUrl(person.avatar_url, size * 2);

  const content = (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-olive/15"
        style={{ width: size, height: size }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={size}
            height={size}
            className="h-full w-full object-cover"
          />
        ) : (
          <UserCircleIcon className={compact ? "h-6 w-6 text-olive" : "h-7 w-7 text-olive"} />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-forest">{name}</p>
        {meta && <p className="truncate text-sm text-sage">{meta}</p>}
        {!compact && person.bio && (
          <p className="mt-0.5 line-clamp-1 text-sm text-sage/90">{person.bio}</p>
        )}
      </div>
    </div>
  );

  return (
    <li className="flex items-center justify-between gap-3 border-b border-mist/80 py-3.5 last:border-0">
      {person.barPath ? (
        <AppLink href={person.barPath} className="min-w-0 flex-1 hover:opacity-90">
          {content}
        </AppLink>
      ) : (
        <div className="min-w-0 flex-1">{content}</div>
      )}
      <FollowButton
        userId={person.id}
        compact
        className="shrink-0"
        onChange={onFollowChange}
      />
    </li>
  );
}
