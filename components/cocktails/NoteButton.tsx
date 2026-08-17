"use client";

import { useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { PencilSquareIcon as PencilSquareSolidIcon } from "@heroicons/react/24/solid";
import { useCocktailNotes } from "@/hooks/useCocktailNotes";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { CocktailNoteDialog } from "./CocktailNoteDialog";

interface NoteButtonProps {
  cocktail: {
    id: string;
    name: string;
    slug?: string;
    imageUrl?: string;
  };
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function NoteButton({
  cocktail,
  size = "md",
  showLabel = false,
  className = "",
}: NoteButtonProps) {
  const { isAuthenticated } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const { isLoading, getNote, saveNote, deleteNote } = useCocktailNotes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const existing = getNote(cocktail.id);
  const hasNote = Boolean(existing?.notes);

  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthDialog({
        title: "Save notes on drinks",
        subtitle:
          "Log in or create a free account to keep private tasting notes on any cocktail.",
      });
      return;
    }
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className={`${iconSizes[size]} bg-sage/30 rounded animate-pulse`} />
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          ${sizeClasses[size]}
          ${className}
          group flex items-center gap-2 rounded-lg transition-all
          ${hasNote
            ? "text-forest hover:text-olive"
            : "text-slate-400 hover:text-forest"
          }
          hover:bg-forest/10
          focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40
        `}
        aria-label={
          hasNote
            ? `Edit your note on ${cocktail.name}`
            : `Add a note on ${cocktail.name}`
        }
        aria-pressed={hasNote}
      >
        {hasNote ? (
          <PencilSquareSolidIcon className={iconSizes[size]} />
        ) : (
          <PencilSquareIcon className={iconSizes[size]} />
        )}
        {showLabel && (
          <span className="text-sm font-medium">
            {hasNote ? "Note" : "Add note"}
          </span>
        )}
      </button>

      <CocktailNoteDialog
        isOpen={dialogOpen}
        cocktailName={cocktail.name}
        initialNotes={existing?.notes}
        onClose={() => setDialogOpen(false)}
        onSave={async (notes) => {
          await saveNote(cocktail, notes);
        }}
        onDelete={
          hasNote
            ? async () => {
                await deleteNote(cocktail.id);
              }
            : undefined
        }
      />
    </>
  );
}
