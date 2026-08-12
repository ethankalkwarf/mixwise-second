interface ComingSoonCocktailImageProps {
  name: string;
  className?: string;
  /** Compact for cards; default is detail-page scale */
  size?: "card" | "hero";
}

/**
 * Placeholder when a cocktail has no photo yet.
 * Keeps layout stable and signals photography is pending.
 */
export function ComingSoonCocktailImage({
  name,
  className = "",
  size = "hero",
}: ComingSoonCocktailImageProps) {
  const isCard = size === "card";

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-mist via-cream to-mist ${className}`}
      role="img"
      aria-label={`${name} photo coming soon`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(188,90,69,0.12), transparent 45%), radial-gradient(circle at 80% 70%, rgba(58,77,57,0.1), transparent 40%)",
        }}
      />
      <div
        className={`relative z-10 mx-4 flex flex-col items-center text-center ${
          isCard ? "gap-1.5" : "gap-2"
        }`}
      >
        <p
          className={`font-serif font-semibold tracking-wide text-forest ${
            isCard ? "text-sm" : "text-lg md:text-xl"
          }`}
        >
          Coming Soon
        </p>
        <p
          className={`max-w-[16rem] text-sage ${
            isCard ? "text-[11px] leading-snug" : "text-sm"
          }`}
        >
          Photo for {name} is on the way
        </p>
      </div>
    </div>
  );
}
