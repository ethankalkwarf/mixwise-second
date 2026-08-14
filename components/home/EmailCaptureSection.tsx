"use client";

import { useUser } from "@/components/auth/UserProvider";
import { EmailListCapture } from "@/components/email/EmailListCapture";

export function EmailCaptureSection() {
  const { isAuthenticated } = useUser();

  if (isAuthenticated) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-mist/40 py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-3 [text-wrap:balance] font-display text-3xl font-bold text-forest sm:text-4xl">
          New cocktails{" "}
          <span className="italic text-terracotta">every week</span>
        </h2>
        <p className="mx-auto mb-8 max-w-md [text-wrap:pretty] text-base leading-relaxed text-sage sm:text-lg">
          Join the list for fresh recipes worth making at home.
        </p>

        <EmailListCapture source="homepage" variant="light" />
      </div>
    </section>
  );
}
