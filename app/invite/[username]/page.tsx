"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { rememberInviteUsername, captureInviteFromLocation } from "@/lib/invite";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { usePreferredAuthMode } from "@/lib/auth/returning-user";
import { BrandLogo } from "@/components/common/BrandLogo";

export default function InviteLandingPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const [username, setUsername] = useState<string>("");
  const { isAuthenticated, isLoading } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const preferredAuthMode = usePreferredAuthMode();
  const router = useRouter();

  useEffect(() => {
    void params.then((p) => {
      const u = decodeURIComponent(p.username).replace(/^@/, "");
      setUsername(u);
      rememberInviteUsername(u);
      captureInviteFromLocation();
    });
  }, [params]);

  useEffect(() => {
    if (!username || isLoading) return;
    if (isAuthenticated) {
      // Already signed in — follow then open their bar
      void (async () => {
        try {
          await fetch("/api/follows", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
          });
        } catch {
          /* ignore */
        }
        router.replace(`/bar/${encodeURIComponent(username)}`);
      })();
    }
  }, [username, isAuthenticated, isLoading, router]);

  const join = () => {
    rememberInviteUsername(username);
    openAuthDialog({
      mode: preferredAuthMode === "login" ? "signup" : preferredAuthMode,
      title: `Join ${username} on MixWise`,
      subtitle: "Create a free account — you'll automatically follow their bar.",
    });
  };

  return (
    <div className="min-h-[70vh] py-16">
      <MainContainer>
        <div className="mx-auto max-w-md text-center">
          <BrandLogo size="lg" variant="dark" />
          <h1 className="font-serif text-3xl font-bold text-forest">
            You&apos;re invited
          </h1>
          <p className="mt-3 text-sage">
            {username ? (
              <>
                <span className="font-medium text-forest">@{username}</span> wants you to see what
                they&apos;re mixing on MixWise.
              </>
            ) : (
              "Loading invite…"
            )}
          </p>
          {!isLoading && !isAuthenticated && username && (
            <div className="mt-8 space-y-3">
              <button type="button" onClick={join} className="btn-primary w-full sm:w-auto">
                Join & follow @{username}
              </button>
              <p className="text-xs text-sage">
                Free account. You can unfollow anytime.
              </p>
            </div>
          )}
          {isAuthenticated && (
            <p className="mt-6 text-sm text-sage">Opening their bar…</p>
          )}
        </div>
      </MainContainer>
    </div>
  );
}
