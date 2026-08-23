/** Shared section chrome for brand pages. */
export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-terracotta">
      {children}
    </p>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 [text-wrap:balance] font-display text-3xl leading-tight text-forest sm:text-4xl">
      {children}
    </h2>
  );
}
