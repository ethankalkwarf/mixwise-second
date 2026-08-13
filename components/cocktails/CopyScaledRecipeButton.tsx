"use client";

import { useState } from "react";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

type Props = {
  cocktailName: string;
  quantity: number;
  ingredientLines: string[];
};

export function CopyScaledRecipeButton({ cocktailName, quantity, ingredientLines }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const header =
      quantity === 1
        ? `${cocktailName} — ingredients`
        : `${cocktailName} — batch for ${quantity} drinks`;
    const body = ingredientLines.map((line) => `• ${line}`).join("\n");
    const tip =
      quantity >= 6
        ? "\n\nHosting tip: mix in a pitcher, keep cold, and pour over fresh ice when serving."
        : "";
    try {
      await navigator.clipboard.writeText(`${header}\n${body}${tip}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-white border border-mist hover:bg-mist/40 text-forest text-sm font-medium rounded-xl transition-colors"
    >
      {copied ? (
        <>
          <CheckIcon className="w-4 h-4 text-olive" />
          Copied batch list
        </>
      ) : (
        <>
          <ClipboardDocumentIcon className="w-4 h-4" />
          Copy {quantity > 1 ? "scaled" : ""} ingredients
        </>
      )}
    </button>
  );
}
