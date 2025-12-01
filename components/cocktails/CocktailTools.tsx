export function CocktailTools() {
  const tools = ["Shaker", "Jigger", "Strainer"];

  return (
    <>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tools Needed</h3>
      <div className="flex gap-3 text-sm text-sage">
        {tools.map((tool) => (
          <span key={tool} className="font-medium">
            {tool}
          </span>
        ))}
      </div>
    </>
  );
}
