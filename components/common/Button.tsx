import React from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary";

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
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lime-400 focus-visible:ring-offset-slate-950";

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-lime-400 text-slate-950 hover:bg-lime-300",
    secondary:
      "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-600"
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


