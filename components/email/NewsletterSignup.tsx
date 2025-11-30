"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface NewsletterSignupProps {
  source?: string;
  compact?: boolean;
}

export function NewsletterSignup({ source = "footer", compact = false }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const toast = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);

    try {
      const { error: dbError } = await supabase
        .from("email_signups")
        .insert({
          email: email.trim().toLowerCase(),
          source,
        });

      if (dbError) {
        // Ignore duplicate errors
        if (dbError.code === "23505") {
          setIsSuccess(true);
          toast.info("You're already subscribed!");
        } else {
          throw dbError;
        }
      } else {
        setIsSuccess(true);
        toast.success("Thanks for subscribing!");
      }
    } catch (err) {
      console.error("Newsletter signup error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`flex items-center gap-2 ${compact ? "text-sm" : ""}`}>
        <CheckCircleIcon className="w-5 h-5 text-lime-400 flex-shrink-0" />
        <span className="text-slate-300">You&apos;re subscribed!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className={`w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-9 pr-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-lime-500/50 transition-colors ${
              compact ? "py-2 text-sm" : "py-2.5"
            }`}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className={`bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
            compact ? "px-3 py-2 text-sm" : "px-4 py-2.5"
          }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
          ) : (
            "Subscribe"
          )}
        </button>
      </div>
    </form>
  );
}

