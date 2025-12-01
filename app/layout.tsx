import "./globals.css";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { SupabaseProvider } from "./providers";
import { SiteHeader, NavItem } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { OrganizationSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/seo";

// Use system fonts to avoid Google Fonts network issues during build
// In production, these will be replaced with web fonts via CSS
const fontClasses = "";

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  metadataBase: new URL(SITE_CONFIG.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    creator: SITE_CONFIG.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#F9F7F2",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Simplified navigation - only essential items
  const navItems: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Cocktails", href: "/cocktails" },
    { label: "Mix", href: "/mix" },
  ];

  // Don't fetch session server-side to avoid static generation issues
  // Let client-side providers handle session fetching
  const initialSession = null;

  return (
    <html lang="en">
      <head>
        <OrganizationSchema />
      </head>
      <body className="bg-cream text-charcoal font-sans antialiased">
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        
        <SupabaseProvider initialSession={initialSession}>
          <div className="min-h-screen flex flex-col">
            <SiteHeader navItems={navItems} />
            <main id="main-content" className="flex-1 flex flex-col" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
