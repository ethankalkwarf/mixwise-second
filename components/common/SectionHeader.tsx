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
        className="text-2xl sm:text-3xl font-display font-bold text-forest"
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-sage mt-2 max-w-xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
