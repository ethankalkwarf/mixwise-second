"use client";

export function MixSkeleton() {
  return (
    <div className="py-10 bg-cream min-h-screen" aria-busy="true" aria-label="Loading Mix tool">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        {/* Page Header Skeleton */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="skeleton h-12 w-64 rounded-2xl" />
            <div className="skeleton h-8 w-12 rounded-full" />
          </div>
          <div className="skeleton h-6 w-96 rounded-2xl mb-6" />
          <div className="flex gap-4">
            <div className="skeleton h-14 w-80 rounded-2xl" />
            <div className="skeleton h-12 w-48 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="space-y-8">
          {/* Step Navigation Skeleton */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-mist z-50">
            <div className="grid grid-cols-3 py-safe">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center py-3 px-2">
                  <div className="w-6 h-6 rounded-full bg-mist mb-1" />
                  <div className="skeleton h-3 w-12 rounded mb-1" />
                  <div className="skeleton h-2 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Content based on step */}
          <div className="pb-20 lg:pb-0">
            {/* Step 1: Cabinet - Basics Section */}
            <div className="bg-gradient-to-r from-terracotta/5 to-olive/5 border border-terracotta/20 rounded-3xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-terracotta/20 rounded-xl" />
                <div>
                  <div className="skeleton h-6 w-48 rounded-2xl mb-2" />
                  <div className="skeleton h-4 w-64 rounded-2xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-white border border-mist rounded-xl p-3">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-mist rounded mb-2 mx-auto" />
                      <div className="skeleton h-4 w-full rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories Grid */}
            <div className="mb-8">
              <div className="skeleton h-6 w-40 rounded-2xl mb-4" />
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-6 rounded-2xl border-2 border-mist">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-8 h-8 bg-mist rounded-full" />
                      <div className="flex-1">
                        <div className="skeleton h-5 w-20 rounded-2xl mb-1" />
                        <div className="skeleton h-3 w-16 rounded-2xl" />
                      </div>
                    </div>
                    <div className="skeleton h-4 w-full rounded-2xl mb-2" />
                    <div className="skeleton h-3 w-3/4 rounded-2xl" />
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Results Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="skeleton h-8 w-48 rounded-2xl mb-2" />
                  <div className="skeleton h-4 w-64 rounded-2xl" />
                </div>
              </div>

              {/* Cocktail Grid */}
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white border border-mist rounded-3xl overflow-hidden">
                    <div className="h-52 bg-mist" />
                    <div className="p-5">
                      <div className="skeleton h-6 w-32 rounded-2xl mb-3" />
                      <div className="skeleton h-4 w-full rounded-2xl mb-2" />
                      <div className="skeleton h-4 w-4/5 rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Almost There Section */}
              <div className="bg-gradient-to-r from-terracotta/5 to-olive/5 border border-terracotta/20 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-terracotta/20 rounded-2xl" />
                  <div>
                    <div className="skeleton h-6 w-64 rounded-2xl mb-2" />
                    <div className="skeleton h-4 w-80 rounded-2xl" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-mist rounded-2xl p-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <div className="skeleton h-5 w-24 rounded-2xl mb-2" />
                          <div className="skeleton h-4 w-32 rounded-2xl mb-3" />
                          <div className="skeleton h-8 w-full rounded-xl" />
                        </div>
                        <div className="w-16 h-16 bg-mist rounded-lg flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
