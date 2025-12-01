import React from "react";
import clsx from "clsx";

interface MainContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContainer({ children, className }: MainContainerProps) {
  return (
    <div className={clsx("max-w-5xl mx-auto px-4 sm:px-6", className)}>
      {children}
    </div>
  );
}
