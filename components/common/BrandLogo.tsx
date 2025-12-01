"use client";

import Link from "next/link";

interface BrandLogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BrandLogo({ variant = "dark", size = "md", className = "" }: BrandLogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const colorClasses = {
    light: "text-cream",
    dark: "text-forest",
  };

  return (
    <Link
      href="/"
      className={`font-display font-bold ${sizeClasses[size]} ${colorClasses[variant]} hover:opacity-80 transition-opacity ${className}`}
      aria-label="MixWise Home"
    >
      mixwise.
    </Link>
  );
}

