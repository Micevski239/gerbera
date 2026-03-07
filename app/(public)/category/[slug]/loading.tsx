export default function Loading() {
  return (
    <div className="bg-canvas-100 min-h-screen">
      {/* Hero skeleton */}
      <div className="bg-secondary-50 py-12 md:py-16">
        <div className="container-custom text-center">
          <div className="skeleton-text w-32 h-6 mx-auto mb-4 rounded-full" />
          <div className="skeleton-text w-56 h-10 mx-auto mb-3" />
          <div className="skeleton-text w-72 h-5 mx-auto" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
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
  )
}
