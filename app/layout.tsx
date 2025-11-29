import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SupabaseProvider } from "./providers";
import { SiteHeader, NavItem } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "MixWise (Second Instance)",
  description: "A separate MixWise instance powered by Next.js and Sanity."
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const navItems: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Cocktails", href: "/cocktails" },
    { label: "Mix", href: "/mix" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" }
  ];

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-slate-950 text-slate-50 font-sans selection:bg-brand/30">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-10" />
        <SupabaseProvider initialSession={null}>
          <div className="min-h-screen flex flex-col">
            <SiteHeader navItems={navItems} />
            <main className="flex-1 flex flex-col">{children}</main>
            <SiteFooter />
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
