import React from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const variants: Record<ButtonVariant, string> = {
    primary: 
      "bg-terracotta text-cream shadow-lg shadow-terracotta/20 hover:bg-terracotta-dark focus-visible:ring-terracotta focus-visible:ring-offset-cream",
    secondary:
      "bg-forest text-cream hover:bg-charcoal focus-visible:ring-forest focus-visible:ring-offset-cream",
    ghost:
      "bg-white text-forest border border-mist hover:bg-mist/50 hover:border-stone focus-visible:ring-forest"
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
