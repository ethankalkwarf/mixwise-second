"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useToast } from "@/components/ui/toast";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { resetAnalyticsUser } from "@/lib/analytics/client";

const CONFIRM_PHRASE = "DELETE";

type Props = {
  className?: string;
  /** Match account page card styling when nested in More. */
  compact?: boolean;
};

export function DeleteAccountSection({ className = "", compact = false }: Props) {
  const router = useRouter();
  const toast = useToast();
  const { signOut } = useUser();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    if (deleting) return;
    setOpen(false);
    setConfirmText("");
  }, [deleting]);

  const dialogRef = useDialogA11y({
    isOpen: open,
    onClose: close,
    initialFocusRef: inputRef,
  });

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_PHRASE || deleting) return;

    setDeleting(true);
    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: CONFIRM_PHRASE }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(
          typeof data.error === "string" ? data.error : "Couldn't delete account"
        );
        setDeleting(false);
        return;
      }

      resetAnalyticsUser();
      try {
        await signOut();
      } catch {
        // Session may already be invalid after delete — continue.
      }

      toast.success("Your account has been deleted");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Couldn't delete account. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div className={className}>
      <div className={compact ? "space-y-1" : "space-y-2"}>
        <p className="text-sm font-semibold text-forest">Delete account</p>
        <p className="text-sm text-sage">
          Permanently remove your MixWise account, bar, favorites, and notes.
          This cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 text-sm font-semibold text-terracotta underline-offset-2 hover:underline"
        >
          Delete my account…
        </button>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={(node) => {
              dialogRef.current = node;
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-mist p-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/20">
                  <ExclamationTriangleIcon className="h-5 w-5 text-terracotta" />
                </div>
                <h2
                  id={titleId}
                  className="font-display text-xl font-bold text-forest"
                >
                  Delete account?
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-sage">
                This permanently deletes your profile, bar, favorites, notes, and
                related data. Type <span className="font-semibold text-forest">{CONFIRM_PHRASE}</span>{" "}
                to confirm.
              </p>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label htmlFor="delete-confirm" className="label-botanical mb-1.5">
                  Confirmation
                </label>
                <input
                  ref={inputRef}
                  id="delete-confirm"
                  type="text"
                  autoComplete="off"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  disabled={deleting}
                  className="input-botanical w-full uppercase tracking-wide"
                  placeholder={CONFIRM_PHRASE}
                  aria-describedby="delete-confirm-hint"
                />
                <p id="delete-confirm-hint" className="mt-1.5 text-xs text-sage">
                  Must match exactly: {CONFIRM_PHRASE}
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={close}
                  disabled={deleting}
                  className="flex-1 rounded-2xl border border-mist bg-white px-4 py-3 font-medium text-sage transition hover:bg-mist disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={deleting || confirmText !== CONFIRM_PHRASE}
                  className="flex-1 rounded-2xl bg-terracotta px-4 py-3 font-bold text-cream transition hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete forever"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
