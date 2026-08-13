"use client";

import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

const DISMISS_KEY = "mixwise-set-password-dismissed";

export function SetPasswordPrompt() {
  const { user, isAuthenticated, refreshProfile } = useUser();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setOpen(false);
      return;
    }

    const needsPassword = user.user_metadata?.needs_password === true;
    const isOAuth = user.identities?.some(
      (i) => i.provider === "google" || i.provider === "apple"
    );
    const dismissed =
      typeof window !== "undefined" &&
      sessionStorage.getItem(DISMISS_KEY) === "1";

    setOpen(Boolean(needsPassword && !isOAuth && !dismissed));
  }, [isAuthenticated, user]);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: { needs_password: false },
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      await refreshProfile();
      sessionStorage.setItem(DISMISS_KEY, "1");
      setOpen(false);
      toast.success("Password saved. You can sign in with email anytime.");
    } catch {
      setError("Failed to save password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleDismiss}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-forest/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-md rounded-3xl border border-mist bg-white p-6 text-left shadow-card-hover sm:p-8">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="absolute right-4 top-4 rounded-xl p-2 text-sage hover:bg-mist hover:text-forest"
                  aria-label="Dismiss"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>

                <Dialog.Title className="mb-2 font-display text-xl font-bold text-forest">
                  Finish setting up your account
                </Dialog.Title>
                <p className="mb-6 text-sm text-sage">
                  Add a password so you can sign in without waiting for an email link.
                  You can skip this for now.
                </p>

                {error && (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-terracotta">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label-botanical" htmlFor="set-password">
                      Password
                    </label>
                    <input
                      id="set-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-botanical"
                      minLength={8}
                      autoComplete="new-password"
                      required
                      placeholder="At least 8 characters"
                    />
                  </div>
                  <div>
                    <label className="label-botanical" htmlFor="set-password-confirm">
                      Confirm password
                    </label>
                    <input
                      id="set-password-confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="input-botanical"
                      minLength={8}
                      autoComplete="new-password"
                      required
                      placeholder="Confirm password"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-terracotta px-4 py-3 font-bold text-cream transition-colors hover:bg-terracotta-dark disabled:opacity-50"
                  >
                    {loading ? "Saving…" : "Save password"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="w-full py-2 text-sm text-sage hover:text-forest"
                  >
                    Not now
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
