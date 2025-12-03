interface CocktailInstructionsProps {
  instructions: string[];
  tips?: string[];
}

export function CocktailInstructions({ instructions, tips }: CocktailInstructionsProps) {
  return (
    <div>
      <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">
        Instructions
      </h2>

      <ol className="space-y-4">
        {instructions.map((step, index) => (
          <li key={index} className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-terracotta text-cream flex items-center justify-center font-bold">
              {index + 1}
            </span>
            <p className="text-lg text-gray-700 leading-relaxed">{step}</p>
          </li>
        ))}
      </ol>

      {tips && tips.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h4 className="font-bold text-gray-900 mb-3">Pro Tips</h4>
          <ul className="space-y-2 text-gray-600">
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

