/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'usgsomofsav4obpi.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'uvmbmlahkwmlomfoeaha.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // External cocktail image sources
      {
        protocol: 'https',
        hostname: 'iba-world.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.thecocktaildb.com',
        pathname: '/images/**',
      },
    ],
    // Optimize image loading performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable WebP and AVIF formats for better compression
    formats: ['image/webp', 'image/avif'],
    // Next 16 defaults to [75] only; unlisted qualities spam huge warnings
    // that freeze the browser console. Keep every quality we actually use.
    qualities: [70, 75, 85, 90, 92],
    // Aggressive optimization for better performance
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enable compression
  compress: true,
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: '/account-benefits',
        destination: '/about',
        permanent: true,
      },
    ];
  },
  // Long-lived caches are for production hashed assets only.
  // In dev, immutable /_next/static caching serves stale JS and breaks hydration.
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [
        {
          source: "/_next/static/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "no-store, must-revalidate",
            },
          ],
        },
      ];
    }

    return [
      {
        source: "/api/cocktails/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/bar/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        ],
      },
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

