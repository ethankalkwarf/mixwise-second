"use client";

import { BrandLogo, type BrandLogoSize } from "@/components/common/BrandLogo";

type MixwiseTypeMarkProps = {
  className?: string;
  size?: "sm" | "lg";
};

/** @deprecated Prefer BrandLogo — kept for brand-preview demos. */
export function MixwiseTypeMark({ className, size = "lg" }: MixwiseTypeMarkProps) {
  const brandSize: BrandLogoSize = size === "sm" ? "md" : "lg";
  return (
    <BrandLogo
      variant="dark"
      size={brandSize}
      linked={false}
      className={className}
    />
  );
}
