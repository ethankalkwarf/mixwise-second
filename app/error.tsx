"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
        Something went wrong
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-forest sm:text-4xl">
        This page hit a snag
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-sage">
        MixWise ran into an error loading this screen. You can try again without
        losing your place.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-8 inline-flex items-center rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream shadow-sm transition-all duration-200 hover:bg-terracotta-dark hover:shadow-md active:scale-95"
      >
        Try again
      </button>
    </div>
  );
}
