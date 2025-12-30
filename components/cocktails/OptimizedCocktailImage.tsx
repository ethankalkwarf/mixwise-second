import Image from "next/image";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";

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
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

export function OptimizedCocktailImage({
  src,
  alt,
  className = "",
  fill = true,
  priority = false,
  sizes,
  quality = 80,
  placeholder = "blur",
  blurDataURL = COCKTAIL_BLUR_DATA_URL,
  onClick
}: OptimizedCocktailImageProps) {
  if (fill) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          className="object-cover"
          onClick={onClick}
        />
      </div>
    );
  }

  // For non-fill images, we need width and height
  const imageWidth = width || 400;
  const imageHeight = height || 300;

  return (
    <Image
      src={src}
      alt={alt}
      width={imageWidth}
      height={imageHeight}
      priority={priority}
      sizes={sizes}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      className={className}
      onClick={onClick}
    />
  );
}
