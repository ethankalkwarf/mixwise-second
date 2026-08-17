"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useToast } from "@/components/ui/toast";
import type { CocktailNote } from "@/lib/supabase/database.types";

export type NoteCocktailInput = {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string;
};

interface UseCocktailNotesResult {
  notes: CocktailNote[];
  noteIds: Set<string>;
  isLoading: boolean;
  getNote: (cocktailId: string) => CocktailNote | undefined;
  saveNote: (cocktail: NoteCocktailInput, notes: string) => Promise<boolean>;
  deleteNote: (cocktailId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

/**
 * Private per-drink notes for authenticated users.
 */
export function useCocktailNotes(): UseCocktailNotesResult {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const supabase = getSupabaseClient();
  const { openAuthDialog } = useAuthDialog();
  const toast = useToast();
  const [notes, setNotes] = useState<CocktailNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const lastFetchedUserId = useRef<string | null>(null);
  const isFetching = useRef(false);

  const noteIds = useMemo(
    () => new Set(notes.map((note) => note.cocktail_id)),
    [notes]
  );

  const loadNotes = useCallback(
    async (userId: string) => {
      if (isFetching.current) return;
      isFetching.current = true;

      const { data, error } = await supabase
        .from("cocktail_notes")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error loading cocktail notes:", error);
      } else {
        setNotes(data || []);
        lastFetchedUserId.current = userId;
      }

      isFetching.current = false;
    },
    [supabase]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      setNotes([]);
      setIsLoading(false);
      lastFetchedUserId.current = null;
      return;
    }

    if (lastFetchedUserId.current !== user.id) {
      setIsLoading(true);
      loadNotes(user.id).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, user?.id, loadNotes]);

  const getNote = useCallback(
    (cocktailId: string) => notes.find((note) => note.cocktail_id === cocktailId),
    [notes]
  );

  const requireAuth = useCallback(() => {
    if (isAuthenticated && user) return true;
    openAuthDialog({
      title: "Save notes on drinks",
      subtitle:
        "Log in or create a free account to keep private tasting notes on any cocktail.",
    });
    return false;
  }, [isAuthenticated, user, openAuthDialog]);

  const deleteNote = useCallback(
    async (cocktailId: string) => {
      if (!requireAuth() || !user) return false;

      const previous = notes;
      setNotes((prev) => prev.filter((note) => note.cocktail_id !== cocktailId));

      const { error } = await supabase
        .from("cocktail_notes")
        .delete()
        .eq("user_id", user.id)
        .eq("cocktail_id", cocktailId);

      if (error) {
        console.error("Error deleting cocktail note:", error);
        toast.error("Failed to delete note");
        setNotes(previous);
        return false;
      }

      toast.info("Note removed");
      return true;
    },
    [requireAuth, user, notes, supabase, toast]
  );

  const saveNote = useCallback(
    async (cocktail: NoteCocktailInput, text: string) => {
      if (!requireAuth() || !user) return false;

      const trimmed = text.trim();
      if (!trimmed) {
        return deleteNote(cocktail.id);
      }

      const now = new Date().toISOString();
      const existing = notes.find((note) => note.cocktail_id === cocktail.id);
      const optimistic: CocktailNote = existing
        ? { ...existing, notes: trimmed, updated_at: now }
        : {
            id: -Date.now(),
            user_id: user.id,
            cocktail_id: cocktail.id,
            cocktail_name: cocktail.name,
            cocktail_slug: cocktail.slug || null,
            cocktail_image_url: cocktail.imageUrl || null,
            notes: trimmed,
            created_at: now,
            updated_at: now,
          };

      setNotes((prev) => [
        optimistic,
        ...prev.filter((note) => note.cocktail_id !== cocktail.id),
      ]);

      const { data, error } = await supabase
        .from("cocktail_notes")
        .upsert(
          {
            user_id: user.id,
            cocktail_id: cocktail.id,
            cocktail_name: cocktail.name,
            cocktail_slug: cocktail.slug,
            cocktail_image_url: cocktail.imageUrl,
            notes: trimmed,
            updated_at: now,
          },
          { onConflict: "user_id,cocktail_id" }
        )
        .select()
        .single();

      if (error) {
        console.error("Error saving cocktail note:", error);
        toast.error("Failed to save note");
        lastFetchedUserId.current = null;
        await loadNotes(user.id);
        return false;
      }

      if (data) {
        setNotes((prev) => [
          data,
          ...prev.filter((note) => note.cocktail_id !== cocktail.id),
        ]);
      }

      toast.success("Note saved");
      return true;
    },
    [requireAuth, user, notes, supabase, toast, loadNotes, deleteNote]
  );

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    lastFetchedUserId.current = null;
    setIsLoading(true);
    await loadNotes(user.id);
    setIsLoading(false);
  }, [isAuthenticated, user, loadNotes]);

  return {
    notes,
    noteIds,
    isLoading,
    getNote,
    saveNote,
    deleteNote,
    refresh,
  };
}
