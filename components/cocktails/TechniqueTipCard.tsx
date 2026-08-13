import { LightBulbIcon } from "@heroicons/react/24/outline";
import {
  findTermsInText,
  getMethodTip,
  type GlossaryTerm,
} from "@/lib/cocktailTechniqueGlossary";

interface TechniqueTipCardProps {
  technique?: string | null;
  instructionSteps?: string[];
}

function uniqueTerms(terms: GlossaryTerm[]): GlossaryTerm[] {
  const seen = new Set<string>();
  const out: GlossaryTerm[] = [];
  for (const term of terms) {
    if (seen.has(term.label)) continue;
    seen.add(term.label);
    out.push(term);
  }
  return out;
}

/**
 * Beginner tip card under recipe steps.
 * Uses the cocktail's primary technique plus any jargon found in the steps.
 */
export function TechniqueTipCard({
  technique,
  instructionSteps = [],
}: TechniqueTipCardProps) {
  const method = getMethodTip(technique);
  const stepTerms = uniqueTerms(
    instructionSteps.flatMap((step) => findTermsInText(step))
  ).slice(0, 3);

  if (!method && stepTerms.length === 0) return null;

  return (
    <div className="mt-8 rounded-2xl border border-olive/20 bg-olive/5 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <LightBulbIcon className="mt-0.5 h-5 w-5 shrink-0 text-olive" />
        <div className="min-w-0 flex-1 space-y-3">
          {method ? (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-forest">
                Technique tip · {method.label}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-charcoal">
                {method.summary} {method.tip}
              </p>
            </div>
          ) : (
            <h3 className="text-xs font-bold uppercase tracking-widest text-forest">
              Technique tips
            </h3>
          )}

          {stepTerms.length > 0 && (
            <>
              <ul className="space-y-2 border-t border-olive/15 pt-3">
                {stepTerms.map((term) => (
                  <li key={term.label} className="text-sm leading-relaxed">
                    <span className="font-semibold text-forest">{term.label}:</span>{" "}
                    <span className="text-charcoal/90">{term.explanation}</span>
                    {term.why ? (
                      <span className="text-sage"> {term.why}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-sage">
                Underlined words in the steps are tappable for a quick definition.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
