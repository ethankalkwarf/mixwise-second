"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@/components/auth/UserProvider";
import type { FriendPerson, FriendsTab } from "@/components/friends/types";

export function useFriendsPageState() {
  const { user, isAuthenticated, isLoading } = useUser();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FriendPerson[]>([]);
  const [following, setFollowing] = useState<FriendPerson[]>([]);
  const [searching, setSearching] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(true);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [followingKey, setFollowingKey] = useState(0);
  const [tab, setTab] = useState<FriendsTab>("activity");
  const didSetDefaultTab = useRef(false);
  const searchSeq = useRef(0);

  const loadFollowing = useCallback(async () => {
    if (!isAuthenticated) {
      setFollowing([]);
      setFollowingLoading(false);
      return;
    }
    setFollowingLoading(true);
    try {
      const res = await fetch("/api/follows?list=following");
      if (!res.ok) return;
      const data = await res.json();
      setFollowing(data.people ?? []);
    } catch (err) {
      console.error("Failed to load following:", err);
    } finally {
      setFollowingLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadFollowing();
  }, [loadFollowing, followingKey]);

  useEffect(() => {
    if (didSetDefaultTab.current || followingLoading || !isAuthenticated) return;
    didSetDefaultTab.current = true;
    if (following.length === 0) setTab("find");
  }, [followingLoading, isAuthenticated, following.length]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      setSearchMessage(q.length === 1 ? "Type at least 2 characters" : null);
      return;
    }

    const seq = ++searchSeq.current;
    const handle = window.setTimeout(async () => {
      setSearching(true);
      setSearchMessage(null);
      try {
        const res = await fetch(`/api/friends/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (seq !== searchSeq.current) return;
        if (!res.ok) {
          setSearchMessage(data.error || "Search failed");
          setResults([]);
          return;
        }
        const people = (data.people ?? []) as FriendPerson[];
        setResults(user?.id ? people.filter((p) => p.id !== user.id) : people);
        if (people.length === 0) {
          setSearchMessage("No public bars matched. They need a public bar + username.");
        }
      } catch {
        if (seq !== searchSeq.current) return;
        setSearchMessage("Search failed");
        setResults([]);
      } finally {
        if (seq === searchSeq.current) setSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(handle);
  }, [query, user?.id]);

  const bumpFollowing = useCallback(() => setFollowingKey((k) => k + 1), []);

  return {
    isAuthenticated,
    isLoading,
    query,
    setQuery,
    results,
    following,
    setFollowing,
    searching,
    followingLoading,
    searchMessage,
    inviteOpen,
    setInviteOpen,
    tab,
    setTab,
    loadFollowing,
    bumpFollowing,
  };
}

export type FriendsPageState = ReturnType<typeof useFriendsPageState>;
