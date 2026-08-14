"use client";

import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { usePreferredAuthMode } from "@/lib/auth/returning-user";

export function JoinCtaButton({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  const { openPreferredAuthDialog } = useAuthDialog();
  const preferredMode = usePreferredAuthMode();
  const buttonLabel =
    label ?? (preferredMode === "login" ? "Log in" : "Create a free account");

  return (
    <button
      type="button"
      onClick={() => openPreferredAuthDialog()}
      className={className}
    >
      {buttonLabel}
    </button>
  );
}
