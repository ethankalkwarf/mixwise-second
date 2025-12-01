"use client";

import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useUser } from "@/components/auth/UserProvider";
import {
  BeakerIcon,
  HeartIcon,
  SparklesIcon,
  TrophyIcon,
  ShareIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const BENEFITS = [
  {
    icon: BeakerIcon,
    title: "Save and manage your bar inventory",
    description: "Track all the ingredients in your home bar. Know exactly what you have and what you can make.",
    color: "text-olive",
    bgColor: "bg-olive/10",
  },
  {
    icon: HeartIcon,
    title: "Save favorite cocktails",
    description: "Build your personal collection of go-to recipes. Access them anytime from your dashboard.",
    color: "text-terracotta",
    bgColor: "bg-terracotta/10",
  },
  {
    icon: SparklesIcon,
    title: "Personalized recommendations",
    description: "Get cocktail suggestions based on your taste preferences, skill level, and available ingredients.",
    color: "text-forest",
    bgColor: "bg-forest/10",
  },
  {
    icon: TrophyIcon,
    title: "Earn badges & track progress",
    description: "Unlock achievements as you explore new cocktails and expand your mixology skills.",
    color: "text-terracotta",
    bgColor: "bg-terracotta/10",
  },
  {
    icon: ShareIcon,
    title: "Shareable bar link",
    description: "Share your bar inventory with friends. Let them see what cocktails they can make with your ingredients.",
    color: "text-olive",
    bgColor: "bg-olive/10",
  },
  {
    icon: UserGroupIcon,
    title: "Community recipes (coming soon)",
    description: "Discover and share recipes with the MixWise community. Rate and review cocktails from fellow enthusiasts.",
    color: "text-forest",
    bgColor: "bg-forest/10",
  },
];

export default function AccountBenefitsPage() {
  const { openAuthDialog } = useAuthDialog();
  const { isAuthenticated } = useUser();

  return (
    <div className="py-12 sm:py-16 bg-cream min-h-screen">
      <MainContainer>
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-forest mb-6">
            Powerful cocktail tools for
            <span className="text-terracotta italic"> home bartenders</span>
          </h1>

          <p className="text-base sm:text-lg text-sage max-w-2xl mx-auto mb-8">
            Start using MixWise with our current free features today. Save your bar, get personalized recommendations,
            track your progress, and unlock achievements.
          </p>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-full transition-colors shadow-terracotta"
            >
              Go to Dashboard
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          ) : (
            <button
              onClick={() => openAuthDialog({ mode: "signup" })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-full transition-colors shadow-terracotta"
            >
              Get Started Free
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {BENEFITS.map((benefit, index) => (
            <div
              key={index}
              className="p-6 bg-white border border-mist rounded-2xl hover:shadow-card transition-all"
            >
              <div className={`inline-flex p-3 rounded-xl ${benefit.bgColor} mb-4`}>
                <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
              </div>
              <h3 className="text-lg font-display font-bold text-forest mb-2">
                {benefit.title}
              </h3>
              <p className="text-sage text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* What You Get Section */}
        <div className="bg-white border border-mist rounded-3xl p-8 sm:p-12 mb-16 shadow-soft">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest mb-8 text-center">
            Everything included, no hidden costs
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              "Unlimited bar inventory",
              "Unlimited favorites",
              "Personalized recommendations",
              "Progress tracking",
              "Achievement badges",
              "Public bar sharing",
              "Shareable cocktail cards",
              "Recently viewed history",
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-olive flex-shrink-0" />
                <span className="text-charcoal">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest mb-4">
            Ready to elevate your home bar?
          </h2>
          <p className="text-sage mb-8 max-w-xl mx-auto">
            Join thousands of home bartenders who use MixWise to discover new cocktails 
            and perfect their craft.
          </p>
          
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-full transition-colors shadow-terracotta"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/mix"
                className="px-6 py-3 bg-white hover:bg-mist text-forest font-bold rounded-full border border-mist transition-colors"
              >
                Open Mixology Wizard
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => openAuthDialog({ mode: "signup" })}
                className="px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-full transition-colors shadow-terracotta"
              >
                Get Started Free
              </button>
              <Link
                href="/mix"
                className="px-6 py-3 bg-white hover:bg-mist text-forest font-bold rounded-full border border-mist transition-colors"
              >
                Try First, Sign Up Later
              </Link>
            </div>
          )}
        </div>
      </MainContainer>
    </div>
  );
}
