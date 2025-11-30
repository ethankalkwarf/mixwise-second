"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/components/auth/UserProvider";
import { createClient } from "@/lib/supabase/client";
import { awardSharingBadge } from "@/lib/badgeEngine";
import {
  ArrowDownTrayIcon,
  LinkIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

interface CocktailShareCardProps {
  cocktail: {
    name: string;
    slug: string;
    image?: string;
    description?: string;
    ingredients?: Array<{
      ingredient?: { name: string } | null;
      amount?: string;
    }>;
    primarySpirit?: string;
  };
}

export function CocktailShareCard({ cocktail }: CocktailShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();
  const { user } = useUser();
  const supabase = createClient();

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: 1200,
        height: 630,
      });

      // Create download link
      const link = document.createElement("a");
      link.download = `${cocktail.slug}-mixwise.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Share card downloaded!");

      // Award badge if user is signed in
      if (user) {
        await awardSharingBadge(supabase, user.id, "cocktail");
      }
    } catch (error) {
      console.error("Error generating share card:", error);
      toast.error("Failed to generate share card");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/cocktails/${cocktail.slug}`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    const url = `${window.location.origin}/cocktails/${cocktail.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cocktail.name} | MixWise`,
          text: `Check out this ${cocktail.name} recipe on MixWise!`,
          url,
        });
      } catch (error) {
        // User cancelled share
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const ingredientList = cocktail.ingredients
    ?.filter((i) => i.ingredient?.name)
    .slice(0, 6)
    .map((i) => `${i.amount || ""} ${i.ingredient?.name}`.trim());

  return (
    <div className="space-y-4">
      {/* Share Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          {isGenerating ? "Generating..." : "Download Share Card"}
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg transition-colors"
        >
          <LinkIcon className="w-4 h-4" />
          Copy Link
        </button>

        {typeof navigator !== "undefined" && !!navigator.share && (
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg transition-colors"
          >
            <ShareIcon className="w-4 h-4" />
            Share
          </button>
        )}
      </div>

      {/* Preview Card (hidden but used for generation) */}
      <div className="relative overflow-hidden rounded-xl border border-slate-700">
        <div
          ref={cardRef}
          className="relative bg-slate-950"
          style={{ width: "600px", height: "315px" }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />

          {/* Content */}
          <div className="relative h-full p-8 flex">
            {/* Left side - Image */}
            <div className="w-1/3 h-full flex-shrink-0">
              {cocktail.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cocktail.image}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-slate-800 flex items-center justify-center text-6xl">
                  🍸
                </div>
              )}
            </div>

            {/* Right side - Info */}
            <div className="flex-1 pl-6 flex flex-col justify-between">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-white leading-tight mb-2">
                  {cocktail.name}
                </h2>
                {cocktail.primarySpirit && (
                  <span className="inline-block px-2 py-1 bg-lime-500/20 text-lime-400 text-xs font-medium rounded">
                    {cocktail.primarySpirit}
                  </span>
                )}
              </div>

              {/* Ingredients */}
              {ingredientList && ingredientList.length > 0 && (
                <div className="my-4">
                  <p className="text-slate-400 text-xs mb-2">Ingredients:</p>
                  <div className="flex flex-wrap gap-1">
                    {ingredientList.map((ing, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Branding */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-400 to-emerald-600 flex items-center justify-center text-slate-900 text-xs font-bold">
                  MW
                </div>
                <div>
                  <p className="text-white font-bold text-sm">MixWise</p>
                  <p className="text-slate-400 text-xs">mixwise.app</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 p-2 text-center bg-slate-900">
          Preview (card will be 1200×630px)
        </p>
      </div>
    </div>
  );
}

