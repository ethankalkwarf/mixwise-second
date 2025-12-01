interface CocktailToolsProps {
  method?: string;
}

export function CocktailTools({ method }: CocktailToolsProps) {
  // Determine tools based on method
  const getToolsForMethod = (method?: string): string[] => {
    const baseTools = ["Jigger"];

    switch (method?.toLowerCase()) {
      case "shaken":
        return ["Shaker", "Jigger", "Strainer"];
      case "stirred":
        return ["Mixing Glass", "Bar Spoon", "Strainer"];
      case "built":
        return ["Jigger"];
      case "blended":
        return ["Blender"];
      case "muddled":
        return ["Muddler", "Jigger"];
      default:
        return ["Jigger"];
    }
  };

  const tools = getToolsForMethod(method);

  return (
    <>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tools Needed</h3>
      <div className="flex gap-3 text-sm text-gray-600">
        {tools.map((tool) => (
          <span key={tool} className="font-medium">
            {tool}
          </span>
        ))}
      </div>
    </>
  );
}

