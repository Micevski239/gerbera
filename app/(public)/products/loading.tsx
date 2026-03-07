export default function Loading() {
  return (
    <div className="bg-canvas-100 min-h-screen">
      {/* Hero skeleton */}
      <div className="bg-secondary-50 py-12 md:py-16">
        <div className="container-custom text-center">
          <div className="skeleton-text w-32 h-6 mx-auto mb-4 rounded-full" />
          <div className="skeleton-text w-64 h-10 mx-auto mb-3" />
          <div className="skeleton-text w-48 h-5 mx-auto" />
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Sidebar skeleton — desktop only */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
            <div className="skeleton-text w-24 h-4" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-text w-full h-10 rounded-lg" />
            ))}
            <div className="border-t border-neutral-200" />
            <div className="skeleton-text w-20 h-4" />
            <div className="flex gap-2">
              <div className="skeleton-text flex-1 h-10 rounded-lg" />
              <div className="skeleton-text flex-1 h-10 rounded-lg" />
            </div>
          </aside>

          {/* Grid skeleton */}
          <div className="flex-1 min-w-0">
            {/* Controls bar skeleton */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div className="skeleton-text w-32 h-4" />
              <div className="flex items-center gap-3">
                <div className="skeleton-text w-64 h-10 rounded-lg" />
                <div className="skeleton-text w-36 h-10 rounded-lg" />
                <div className="skeleton-text w-32 h-10 rounded-xl" />
              </div>
            </div>

            {/* Product cards skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="skeleton-image aspect-square rounded-2xl mb-3" />
                  <div className="px-1 space-y-2">
                    <div className="skeleton-text w-3/4 h-4" />
                    <div className="skeleton-text w-1/3 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
