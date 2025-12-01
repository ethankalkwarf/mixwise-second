import { PortableText } from "@/components/PortableText";
import type { SanityBlock } from "@/lib/sanityTypes";

interface CocktailInstructionsProps {
  instructions: SanityBlock[];
  tips?: SanityBlock[];
}

export function CocktailInstructions({ instructions, tips }: CocktailInstructionsProps) {
  return (
    <div>
      <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">
        Instructions
      </h2>

      <div className="prose-instructions">
        <div className="prose prose-lg prose-botanical max-w-none text-charcoal">
          <PortableText value={instructions} />
        </div>

        {tips && tips.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h4 className="font-bold text-gray-900 mb-3">Pro Tips</h4>
            <div className="prose prose-botanical text-gray-600">
              <PortableText value={tips} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

