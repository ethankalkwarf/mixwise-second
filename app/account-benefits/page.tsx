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
    color: "text-lime-400",
    bgColor: "bg-lime-500/10",
  },
  {
    icon: HeartIcon,
    title: "Save favorite cocktails",
    description: "Build your personal collection of go-to recipes. Access them anytime from your dashboard.",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: SparklesIcon,
    title: "Personalized recommendations",
    description: "Get cocktail suggestions based on your taste preferences, skill level, and available ingredients.",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: TrophyIcon,
    title: "Earn badges & track progress",
    description: "Unlock achievements as you explore new cocktails and expand your mixology skills.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: ShareIcon,
    title: "Shareable bar link",
    description: "Share your bar inventory with friends. Let them see what cocktails they can make with your ingredients.",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
  },
  {
    icon: UserGroupIcon,
    title: "Community recipes (coming soon)",
    description: "Discover and share recipes with the MixWise community. Rate and review cocktails from fellow enthusiasts.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
];

export default function AccountBenefitsPage() {
  const { openAuthDialog } = useAuthDialog();
  const { isAuthenticated } = useUser();

  return (
    <div className="py-12 sm:py-16">
      <MainContainer>
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-500/10 border border-lime-500/20 rounded-full text-lime-400 text-sm font-medium mb-6">
            <SparklesIcon className="w-4 h-4" />
            100% Free Forever
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-slate-100 mb-6">
            Your Personal
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-500"> Cocktail Hub</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Create a free MixWise account to save your bar, get personalized recommendations, 
            track your progress, and unlock achievements.
          </p>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold text-lg rounded-xl transition-colors"
            >
              Go to Dashboard
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          ) : (
            <button
              onClick={() => openAuthDialog()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold text-lg rounded-xl transition-colors"
            >
              Create My Free Account
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {BENEFITS.map((benefit, index) => (
            <div
              key={index}
              className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors"
            >
              <div className={`inline-flex p-3 rounded-xl ${benefit.bgColor} mb-4`}>
                <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">
                {benefit.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* What You Get Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-3xl p-8 sm:p-12 mb-16">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 mb-8 text-center">
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
                <CheckCircleIcon className="w-5 h-5 text-lime-400 flex-shrink-0" />
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 mb-4">
            Ready to elevate your home bar?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Join thousands of home bartenders who use MixWise to discover new cocktails 
            and perfect their craft.
          </p>
          
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold rounded-xl transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/mix"
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl transition-colors"
              >
                Try the Mix Tool
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => openAuthDialog()}
                className="px-8 py-4 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold rounded-xl transition-colors"
              >
                Create My Free Account
              </button>
              <Link
                href="/mix"
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl transition-colors"
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




