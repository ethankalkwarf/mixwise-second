"use client";

import Link from "next/link";

export function BrutalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cream border-t-4 border-brutal-black">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-black text-2xl tracking-tighter italic text-brutal-black hover:-rotate-2 transition-transform inline-block">
                MIXWISE!
              </span>
            </Link>
            <p className="mt-4 text-sm font-medium text-brutal-black/70 max-w-xs">
              A smarter way to make cocktails at home. Find recipes, discover what you can make, and level up your mixology skills.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider mb-4 text-brutal-black">
              EXPLORE
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/cocktails" 
                  className="text-sm font-bold text-brutal-black/70 hover:text-brutal-blue transition-colors"
                >
                  All Cocktails
                </Link>
              </li>
              <li>
                <Link 
                  href="/mix" 
                  className="text-sm font-bold text-brutal-black/70 hover:text-brutal-blue transition-colors"
                >
                  Mix Tool
                </Link>
              </li>
              <li>
                <Link 
                  href="/ingredients" 
                  className="text-sm font-bold text-brutal-black/70 hover:text-brutal-blue transition-colors"
                >
                  Ingredients
                </Link>
              </li>
              <li>
                <Link 
                  href="/collections" 
                  className="text-sm font-bold text-brutal-black/70 hover:text-brutal-blue transition-colors"
                >
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider mb-4 text-brutal-black">
              COMPANY
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/about" 
                  className="text-sm font-bold text-brutal-black/70 hover:text-brutal-blue transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/account-benefits" 
                  className="text-sm font-bold text-brutal-black/70 hover:text-brutal-blue transition-colors"
                >
                  Account Benefits
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-sm font-bold text-brutal-black/70 hover:text-brutal-blue transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider mb-4 text-brutal-black">
              ACCOUNT
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-sm font-bold text-brutal-black/70 hover:text-brutal-blue transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/account" 
                  className="text-sm font-bold text-brutal-black/70 hover:text-brutal-blue transition-colors"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link 
                  href="/shopping-list" 
                  className="text-sm font-bold text-brutal-black/70 hover:text-brutal-blue transition-colors"
                >
                  Shopping List
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t-2 border-brutal-black flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-brutal-black/60">
            © {currentYear} MixWise. All rights reserved.
          </p>
          <p className="text-sm font-mono text-brutal-black/40">
            Made with 🍸 for home bartenders
          </p>
        </div>
      </div>
    </footer>
  );
}




