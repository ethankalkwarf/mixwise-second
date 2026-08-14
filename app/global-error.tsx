"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body className="bg-[#F9F7F2] text-[#2C3628] antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
          <title>Something went wrong | MixWise</title>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C45C26]">
            Something went wrong
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            MixWise couldn&apos;t load
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#6B7A62]">
            A site-wide error stopped this page. Try again, or refresh if it
            keeps happening.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-8 inline-flex items-center rounded-full bg-[#C45C26] px-5 py-2.5 text-sm font-semibold text-[#F9F7F2]"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
