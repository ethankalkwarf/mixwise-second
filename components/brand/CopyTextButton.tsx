"use client";

import { useState } from "react";

export function CopyTextButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`rounded-xl border border-mist bg-white px-3 py-1.5 text-xs font-semibold text-forest transition-colors hover:bg-mist/50 ${className}`}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
