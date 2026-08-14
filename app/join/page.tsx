"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { useUser } from "@/components/auth/UserProvider";
import { ACCOUNT_BENEFITS } from "@/lib/accountBenefits";

function JoinContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useUser();
  const email = searchParams.get("email")?.trim().toLowerCase() || "";
  const source = searchParams.get("source") || "homepage";
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const convertHref =
    email && token
      ? `/api/email/convert-to-account?${new URLSearchParams({ email, source, token }).toString()}`
      : undefined;

  if (isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h1 className="font-display text-3xl font-bold text-forest sm:text-4xl">
          You&apos;re already in.
        </h1>
        <p className="mt-3 text-sage">Your bar, favorites, and weekly drinks live here.</p>
        <Link
          href="/mix"
          className="mt-8 inline-flex rounded-full bg-terracotta px-6 py-3 text-sm font-medium text-cream hover:bg-terracotta-dark"
        >
          Open Mix
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-12 lg:grid-cols-2">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
          Free MixWise account
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-forest sm:text-5xl">
          Save the bar. See what you can pour tonight.
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-sage">
          The weekly list is just the email. An account keeps your cabinet, favorites, and shopping list with you.
        </p>
        {error && (
          <p className="mt-4 max-w-md rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-terracotta">
            That link expired or didn&apos;t work. Create your account with Google, Apple, or email.
          </p>
        )}
        <ul className="mt-8 space-y-5">
          {ACCOUNT_BENEFITS.map((benefit) => (
            <li key={benefit.title} className="flex gap-3">
              <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-olive" />
              <div>
                <p className="font-medium text-forest">{benefit.title}</p>
                <p className="text-sm text-sage">{benefit.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <AuthPanel initialEmail={email} convertHref={convertHref} />
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="bg-cream px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white" />}>
          <JoinContent />
        </Suspense>
      </div>
    </div>
  );
}
