import { PortableText } from "@/components/PortableText";
import type { SanityBlock } from "@/lib/sanityTypes";

interface InstructionListProps {
  instructions: SanityBlock[];
  tips?: SanityBlock[];
}

export function InstructionList({ instructions, tips }: InstructionListProps) {
  return (
    <div className="space-y-10">
      {/* Instructions */}
      <section>
        <h2 className="text-3xl font-display font-bold text-forest mb-8">Instructions</h2>
        
        {/* 
          Note: Since instructions come as PortableText, we ideally want them split by blocks 
          to apply the custom numbering style. For standard block content, we'll wrap it 
          in a prose container but with custom list styling override.
        */}
        <div className="instruction-list-container space-y-6">
          {/* Custom rendering for ordered lists logic */}
          <div className="prose prose-lg prose-botanical max-w-none text-charcoal">
             {/* 
               We use a special CSS class 'instruction-step' for styling the numbers.
               Since we can't easily split PortableText blocks without a custom serializer,
               we'll rely on the prose styling but enhanced.
             */}
            <PortableText value={instructions} />
          </div>
        </div>
      </section>

      {/* Pro Tips */}
      {tips && tips.length > 0 && (
        <section className="bg-olive/5 border border-olive/10 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-forest uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-xl">💡</span> Pro Tips
          </h3>
          <div className="prose prose-botanical text-sage">
            <PortableText value={tips} />
          </div>
        </section>
      )}
    </div>
  );
}

