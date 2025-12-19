"use client";

import Image from "next/image";

interface OptimizedCocktailImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  fill?: boolean;
  width?: number;
  height?: number;
  onClick?: () => void;
}

export function OptimizedCocktailImage({
  src,
  alt,
  priority = false,
  className = "",
  sizes,
  quality = 80,
  fill = true,
  width,
  height,
  onClick
}: OptimizedCocktailImageProps) {
  return (
    <div className={`relative ${fill ? '' : 'inline-block'}`}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        quality={quality}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        className={`object-cover ${className}`}
        onClick={onClick}
      />
    </div>
  );
}
