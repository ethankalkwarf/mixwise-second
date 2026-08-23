"use client";

import { useCallback, useState } from "react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/components/ui/toast";

type Props = {
  className?: string;
};

/**
 * Buried opt-out for public bar — tucked in settings, not a main-page toggle.
 */
export function PrivateBarSetting({ className }: Props) {
  const { preferences, updatePreferences } = useUserPreferences();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const makePrivate = useCallback(async () => {
    if (
      !window.confirm(
        "Make your bar private? Friends won't be able to view your cabinet or profile link."
      )
    ) {
      return;
    }

    setBusy(true);
    try {
      const result = await updatePreferences({ public_bar_enabled: false });
      if (result.error) {
        toast.error("Couldn't update privacy setting. Try again.");
        return;
      }
      toast.success("Your bar is now private");
    } finally {
      setBusy(false);
    }
  }, [toast, updatePreferences]);

  if (!preferences?.public_bar_enabled) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-sage">Public bar</p>
          <p className="mt-0.5 text-[11px] leading-snug text-sage/80">
            Anyone with your link can view your cabinet
          </p>
        </div>
        <button
          type="button"
          onClick={() => void makePrivate()}
          disabled={busy}
          className="shrink-0 text-xs font-medium text-sage underline-offset-2 transition hover:text-forest hover:underline disabled:opacity-50"
        >
          {busy ? "Saving…" : "Make private"}
        </button>
      </div>
    </div>
  );
}
