import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  id?: string;
}

export function SectionHeader({ title, subtitle, id }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <h2 
        id={id}
        className="text-2xl sm:text-3xl font-serif font-bold text-slate-50"
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-slate-400 mt-2 max-w-xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
