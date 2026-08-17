import React from "react";
import clsx from "clsx";

interface MainContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContainer({ children, className }: MainContainerProps) {
  const hasMaxWidth = className?.split(/\s+/).some((token) => token.startsWith("max-w-"));
  return (
    <div
      className={clsx(
        "mx-auto px-4 sm:px-6 lg:px-8",
        !hasMaxWidth && "max-w-7xl",
        className
      )}
    >
      {children}
    </div>
  );
}
