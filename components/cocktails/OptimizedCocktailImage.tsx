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
  className = "",
  fill = true,
  onClick
}: OptimizedCocktailImageProps) {
  if (fill) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          onClick={onClick}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onClick={onClick}
      loading="lazy"
    />
  );
}
