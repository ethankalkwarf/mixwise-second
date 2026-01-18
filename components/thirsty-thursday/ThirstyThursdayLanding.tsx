"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { EnvelopeIcon, CheckCircleIcon, SparklesIcon, CalendarDaysIcon, GiftIcon, FireIcon, StarIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/components/ui/toast";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";

interface BackgroundCocktail {
  id: string;
  name: string;
  image_url: string | null;
}

interface ThirstyThursdayLandingProps {
  backgroundCocktails?: BackgroundCocktail[];
}

// Confetti component
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#ec4899', '#a855f7', '#f97316', '#8b5cf6', '#f43f5e'][Math.floor(Math.random() * 5)],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

export function ThirstyThursdayLanding({ backgroundCocktails = [] }: ThirstyThursdayLandingProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Rotate background images every 5 seconds with smooth crossfade
  useEffect(() => {
    if (backgroundCocktails.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % Math.min(backgroundCocktails.length, 5));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [backgroundCocktails.length]);

  // Mouse tracking for interactive gradient
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEmailValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/thirsty-thursday/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      setIsSuccess(true);
      setShowConfetti(true);
      toast.success(data.message || "Successfully signed up!");
      setEmail("");

      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: CalendarDaysIcon,
      title: "Every Thursday",
      description: "A new cocktail recipe, delivered weekly to get you weekend-ready.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: SparklesIcon,
      title: "Curated Selection",
      description: "We've tested 300+ cocktails so you only get the best.",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: FireIcon,
      title: "Expand Your Palate",
      description: "Discover new flavors, techniques, and drinks you'll love.",
      color: "from-orange-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
      {showConfetti && <Confetti />}

      {/* Interactive gradient that follows mouse */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-20"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(236, 72, 153, 0.4), rgba(168, 85, 247, 0.3), transparent 50%)`,
        }}
      />

      {/* Hero Section - Two Column with Rotating Images */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-visible">
        {/* Rotating cocktail images - smooth crossfade */}
        {backgroundCocktails.length > 0 && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {backgroundCocktails.slice(0, 5).map((cocktail, index) => {
              if (!cocktail.image_url) return null;
              const isActive = index === currentImageIndex;
              
              return (
                <div
                  key={cocktail.id}
                  className={`absolute inset-0 transition-opacity duration-[3000ms] ease-in-out ${
                    isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <Image
                    src={cocktail.image_url}
                    alt={cocktail.name}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority={index === 0}
                    quality={85}
                    placeholder="blur"
                    blurDataURL={COCKTAIL_BLUR_DATA_URL}
                    style={{
                      filter: 'brightness(0.5) saturate(1.1)',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 via-pink-900/60 to-orange-900/70" />
                </div>
              );
            })}
          </div>
        )}

        {/* Subtle animated gradient overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-pink-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full py-12 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[85vh]">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left relative" style={{ overflow: 'visible' }}>
              {/* Social Proof Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full text-sm font-bold mb-8 shadow-lg">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 border-2 border-white" />
                  ))}
                </div>
                <span className="font-black">2,500+ subscribers</span>
                <div className="flex items-center gap-1 text-yellow-500">
                  <StarIcon className="w-4 h-4 fill-current" />
                  <span className="text-xs">4.9</span>
                </div>
              </div>

              {/* Main Heading - PERFECTLY FIXED */}
              <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black mb-5 text-white drop-shadow-2xl" style={{ 
                lineHeight: '0.95',
                letterSpacing: '-0.02em',
                paddingBottom: '0.15em',
                overflow: 'visible'
              }}>
                <span className="block" style={{ lineHeight: '1' }}>
                  Thirsty
                </span>
                <span className="block" style={{ lineHeight: '1.15', marginTop: '0.05em' }}>
                  Thursday
                </span>
              </h1>

              <p className="text-2xl sm:text-3xl font-bold text-white mb-3 drop-shadow-lg">
                Your cocktail fix, delivered weekly 🍹
              </p>

              <p className="text-lg sm:text-xl text-white/95 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed drop-shadow-md">
                Join thousands getting a fresh cocktail recipe every Thursday. 
                Premium drinks, expert tips, and zero spam.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">Free forever</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">No spam</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">Unsubscribe anytime</span>
                </div>
              </div>
            </div>

            {/* Right Column - Email Form - PROMINENT */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-lg">
                {!isSuccess ? (
                  <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
                    <h2 className="text-2xl font-black text-gray-800 mb-2 text-center">
                      Get Your Weekly Cocktail
                    </h2>
                    <p className="text-gray-600 text-center mb-6 text-sm">
                      Join 2,500+ cocktail enthusiasts
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-500"></div>
                        <div className="relative flex items-center bg-white rounded-2xl shadow-lg">
                          <EnvelopeIcon className="absolute left-5 w-6 h-6 text-gray-400 group-focus-within:text-pink-500 transition-colors z-10" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            disabled={isSubmitting}
                            className="w-full pl-14 pr-6 py-5 text-lg bg-transparent border-0 rounded-2xl focus:outline-none text-gray-800 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          />
                          {email && isEmailValid && (
                            <CheckCircleIcon className="absolute right-5 w-6 h-6 text-green-500 animate-scale-in z-10" />
                          )}
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={!isEmailValid || isSubmitting}
                        className="w-full px-8 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white font-black text-lg rounded-2xl transition-all shadow-2xl hover:shadow-pink-500/50 transform hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {isSubmitting ? (
                            <>
                              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Signing up...
                            </>
                          ) : (
                            <>
                              <span>Get Weekly Cocktails</span>
                              <span className="text-xl">🚀</span>
                            </>
                          )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </button>
                      {email.trim() && !isEmailValid && (
                        <p className="text-sm text-red-500 text-center font-medium animate-shake">
                          Please enter a valid email address
                        </p>
                      )}
                    </form>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                      We respect your privacy. Unsubscribe anytime.
                    </p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-10 shadow-2xl transform scale-105 transition-all animate-scale-in">
                    <div className="flex flex-col items-center gap-4 text-white">
                      <div className="text-7xl mb-2 animate-bounce">🎉</div>
                      <h3 className="text-3xl font-black">
                        You're in! 🔥
                      </h3>
                      <p className="text-lg text-center opacity-90">
                        Check your inbox—we'll see you next Thursday!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Unique Design */}
      <section className="py-16 sm:py-20 lg:py-24 relative bg-white">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Large Numbered List Style */}
            <div className="space-y-8 sm:space-y-10">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div
                    key={index}
                    className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-6 lg:gap-8 group`}
                  >
                    {/* Visual Element - Medium Number + Icon */}
                    <div className="flex-shrink-0 relative">
                      <div className={`w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        <div className="absolute inset-0 rounded-full bg-white/20 blur-xl" />
                        <div className="relative z-10 text-center">
                          <div className="text-white/20 font-black text-4xl sm:text-5xl lg:text-6xl mb-1" style={{ fontFamily: 'system-ui', lineHeight: '1' }}>
                            {String(index + 1).padStart(2, '0')}
                          </div>
                          <Icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-white mx-auto" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`flex-1 text-center ${isEven ? 'lg:text-left' : 'lg:text-right lg:ml-auto'}`}>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className={`text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto ${isEven ? 'lg:mx-0' : 'lg:ml-auto lg:mr-0'}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats Section */}
      <section className="py-16 sm:py-20 relative overflow-hidden bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-orange-100/50">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="grid sm:grid-cols-3 gap-8 lg:gap-12">
              {[
                { value: "300+", label: "Cocktail Recipes", gradient: "from-pink-600 to-rose-600" },
                { value: "2,500+", label: "Happy Subscribers", gradient: "from-purple-600 to-indigo-600" },
                { value: "100%", label: "Free Forever", gradient: "from-orange-600 to-pink-600" },
              ].map((stat, index) => (
                <div key={index} className="transform hover:scale-110 transition-transform duration-300">
                  <div className={`text-5xl sm:text-6xl font-black mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent animate-count-up`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-700 font-bold text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative bg-white">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
              Ready to Level Up Your Cocktail Game?
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl mx-auto font-medium">
            Join Thirsty Thursday and discover your next favorite drink. 
            From classics to modern bangers, we've got you covered. 💯
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cocktails"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg rounded-2xl transition-all shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 active:scale-100"
            >
              Browse All Recipes 🍸
            </Link>
            <Link
              href="/mix"
              className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-800 hover:border-purple-500 hover:text-purple-600 font-black text-lg rounded-2xl transition-all transform hover:scale-105 active:scale-100 shadow-lg"
            >
              Find Your Perfect Drink 🎯
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
