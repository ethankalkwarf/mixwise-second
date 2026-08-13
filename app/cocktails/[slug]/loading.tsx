export default function CocktailRecipeLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-pulse">
      <div className="h-4 w-40 bg-mist rounded mb-8" />
      <div className="h-12 w-2/3 max-w-md bg-mist rounded mb-6" />
      <div className="h-4 w-full max-w-xl bg-mist rounded mb-10" />
      <div className="h-64 w-full max-w-lg bg-mist rounded-3xl" />
      <p className="mt-8 text-sage text-sm">Loading recipe…</p>
    </main>
  );
}
