"use client";

type Props = {
  onDismiss: () => void;
};

/**
 * Callout shown above the Stories share card on the first mix.
 * Parent owns the dim overlay + elevated z-index on the share panel.
 */
export function FirstPourShareSpotlight({ onDismiss }: Props) {
  return (
    <div
      className="relative z-[81] mb-3 animate-slide-up rounded-2xl bg-forest px-4 py-3.5 text-cream shadow-xl shadow-charcoal/30"
      role="dialog"
      aria-labelledby="first-pour-share-title"
    >
      <p
        id="first-pour-share-title"
        className="font-display text-lg font-bold leading-snug"
      >
        Tell your friends
      </p>
      <p className="mt-1 text-sm leading-snug text-cream/85">
        Snap a photo of your pour and share it to Instagram Stories — they’ll see what you’re mixing.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-3 w-full rounded-xl bg-cream py-2.5 text-sm font-bold text-forest active:scale-[0.98]"
      >
        Got it
      </button>
    </div>
  );
}
