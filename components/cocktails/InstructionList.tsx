interface InstructionListProps {
  instructions: string[];
  tips?: string[];
}

export function InstructionList({ instructions, tips }: InstructionListProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-mist p-6">
      <h3 className="text-xl font-display font-bold text-forest mb-6">
        Instructions
      </h3>

      <ol className="space-y-4">
        {instructions.map((step, index) => (
          <li key={index} className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-terracotta text-cream flex items-center justify-center font-bold">
              {index + 1}
            </span>
            <p className="text-base text-charcoal leading-relaxed">{step}</p>
          </li>
        ))}
      </ol>

      {tips && tips.length > 0 && (
        <div className="mt-8 pt-6 border-t border-mist">
          <h4 className="font-bold text-forest mb-3 flex items-center gap-2">
            <span className="text-lg">💡</span> Pro Tips
          </h4>
          <ul className="space-y-2 text-sage">
            {tips.map((tip, index) => (
              <li key={index} className="flex gap-2">
                <span>•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

