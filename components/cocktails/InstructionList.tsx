import { PortableText } from "@/components/PortableText";
import type { SanityBlock } from "@/lib/sanityTypes";

interface InstructionListProps {
  instructions: SanityBlock[];
  tips?: SanityBlock[];
}

export function InstructionList({ instructions, tips }: InstructionListProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-mist p-6">
      <h3 className="text-xl font-display font-bold text-forest mb-6">
        Instructions
      </h3>

      <div className="prose prose-lg prose-botanical max-w-none text-charcoal">
        <PortableText value={instructions} />
      </div>

      {/* Pro Tips */}
      {tips && tips.length > 0 && (
        <div className="mt-8 pt-6 border-t border-mist">
          <h4 className="font-bold text-forest mb-3 flex items-center gap-2">
            <span className="text-lg">💡</span> Pro Tips
          </h4>
          <div className="prose prose-botanical text-sage">
            <PortableText value={tips} />
          </div>
        </div>
      )}
    </div>
  );
}

