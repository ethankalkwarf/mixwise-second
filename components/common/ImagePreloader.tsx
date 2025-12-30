import { useEffect } from 'react';
import { preloadImage } from '@/lib/sanityImage';

interface ImagePreloaderProps {
  imageUrls: string[];
  priority?: boolean;
}

export function ImagePreloader({ imageUrls, priority = false }: ImagePreloaderProps) {
  useEffect(() => {
    if (priority) {
      // Preload critical images immediately
      imageUrls.forEach(url => {
        preloadImage(url);
      });
    } else {
      // Preload non-critical images after a small delay
      const timer = setTimeout(() => {
        imageUrls.forEach(url => {
          preloadImage(url);
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [imageUrls, priority]);

  return null; // This component doesn't render anything
}

