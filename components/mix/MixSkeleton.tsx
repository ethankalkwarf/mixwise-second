"use client";

export function MixSkeleton() {
  return (
    <div className="mix-page bg-cream min-h-screen" aria-busy="true" aria-label="Loading Mix tool">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <div className="skeleton h-10 w-48 rounded-2xl mb-3" />
              <div className="skeleton h-6 w-80 rounded-2xl" />
            </div>
          </div>
          
          {/* Helper box skeleton */}
          <div className="skeleton h-20 rounded-2xl" />
        </header>

        {/* Main Content Skeleton */}
        <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
          {/* Inventory Panel Skeleton */}
          <aside className="bg-white border border-mist rounded-3xl p-4 space-y-4 h-[600px] shadow-card">
            <div className="flex items-center justify-between">
              <div className="skeleton h-8 w-24 rounded-2xl" />
              <div className="skeleton h-6 w-12 rounded-full" />
            </div>
            <div className="skeleton h-12 rounded-xl" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-8 w-20 rounded-full flex-shrink-0" />
              ))}
            </div>
            
            {/* Essentials grid skeleton */}
            <div className="grid grid-cols-3 gap-2 pt-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
            
            {/* Category items skeleton */}
            <div className="space-y-2 pt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          </aside>

          {/* Results Panel Skeleton */}
          <main className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="skeleton h-10 w-40 rounded-2xl" />
              <div className="skeleton h-10 w-64 rounded-xl" />
            </div>

            {/* Empty state skeleton */}
            <div className="skeleton h-[400px] rounded-3xl" />
          </main>
        </div>
      </div>
    </div>
  );
}
