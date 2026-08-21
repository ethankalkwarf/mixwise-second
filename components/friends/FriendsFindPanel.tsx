"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PersonRow } from "@/components/friends/PersonRow";
import { SuggestedFriends } from "@/components/friends/SuggestedFriends";
import type { FriendPerson } from "@/components/friends/types";

export function FriendsFindPanel({
  query,
  onQueryChange,
  searching,
  searchMessage,
  results,
  onResultFollowChange,
  onSuggestedFollowed,
  inputId = "friend-search",
  showSuggestions = true,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  searching: boolean;
  searchMessage: string | null;
  results: FriendPerson[];
  onResultFollowChange: () => void;
  onSuggestedFollowed: () => void;
  inputId?: string;
  showSuggestions?: boolean;
}) {
  return (
    <div>
      <label htmlFor={inputId} className="label-botanical mb-1.5">
        Search by username or name
      </label>
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-sage" />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="@username or display name"
          className="input-botanical pl-10"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
      {searching && (
        <p className="mt-3 text-sm text-sage" role="status">
          Searching…
        </p>
      )}
      {searchMessage && !searching && results.length === 0 && (
        <p className="mt-3 text-sm text-sage">{searchMessage}</p>
      )}
      {results.length > 0 && (
        <ul className="mt-1">
          {results.map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              onFollowChange={onResultFollowChange}
            />
          ))}
        </ul>
      )}

      {showSuggestions && query.trim().length < 2 && (
        <div className="mt-6 border-t border-mist/80 pt-5">
          <h3 className="text-sm font-semibold text-forest">Suggested</h3>
          <p className="mt-1 mb-3 text-sm text-sage">
            People your friends follow, and public bars you might like.
          </p>
          <SuggestedFriends onFollowed={onSuggestedFollowed} />
        </div>
      )}
    </div>
  );
}
