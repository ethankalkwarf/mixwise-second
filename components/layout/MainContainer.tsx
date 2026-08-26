import React from "react";
import clsx from "clsx";

interface MainContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContainer({ children, className }: MainContainerProps) {
  const tokens = className?.split(/\s+/).filter(Boolean) ?? [];
  const hasMaxWidth = tokens.some((token) => token.startsWith("max-w-"));
  const usesNativeFrame = tokens.includes("native-frame");
  return (
    <div
      className={clsx(
        "mx-auto",
        !usesNativeFrame && "px-4 sm:px-6 lg:px-8",
        !hasMaxWidth && "max-w-7xl",
        className
      )}
    >
      {children}
    </div>
  );
}
