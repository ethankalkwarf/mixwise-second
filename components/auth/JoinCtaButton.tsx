"use client";

import { useAuthDialog } from "@/components/auth/AuthDialogProvider";

export function JoinCtaButton({
  label = "Create a free account",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const { openSignupDialog } = useAuthDialog();

  return (
    <button
      type="button"
      onClick={() => openSignupDialog()}
      className={className}
    >
      {label}
    </button>
  );
}
