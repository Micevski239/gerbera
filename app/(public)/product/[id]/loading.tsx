export default function Loading() {
  return (
    <div className="min-h-screen bg-canvas-100">
      <div className="container-custom py-8">
        {/* Breadcrumb skeleton */}
        <div className="mb-8 flex items-center gap-2">
          <div className="h-4 w-12 bg-neutral-200 rounded animate-pulse" />
          <div className="h-4 w-4 bg-neutral-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
          <div className="h-4 w-4 bg-neutral-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-neutral-200 rounded-2xl animate-pulse" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-20 bg-neutral-200 rounded-lg animate-pulse flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="flex flex-col">
            <div>
              <div className="h-6 w-24 bg-neutral-200 rounded-full animate-pulse mb-3" />
              <div className="h-9 w-3/4 bg-neutral-200 rounded animate-pulse mb-4" />
              <div className="h-7 w-20 bg-neutral-200 rounded animate-pulse mb-6" />
              <div className="space-y-2 mb-6">
                <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-neutral-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="lg:mt-auto">
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-neutral-200 rounded-xl animate-pulse" />
                ))}
              </div>
              <div className="h-px bg-neutral-200 mb-6" />
              <div className="h-12 bg-neutral-200 rounded-full animate-pulse mb-3" />
              <div className="h-12 bg-neutral-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
