import React from "react";
import Link from "next/link";
import { MainContainer } from "./MainContainer";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 mt-8">
      <MainContainer className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">MixWise</span>
          <span>© {year}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-slate-200">
            About
          </Link>
          <Link href="/contact" className="hover:text-slate-200">
            Contact
          </Link>
        </div>
      </MainContainer>
    </footer>
  );
}
