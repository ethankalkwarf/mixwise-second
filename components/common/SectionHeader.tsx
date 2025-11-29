import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-50">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
