export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header skeleton */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-24 bg-gray-800 rounded animate-pulse" />
            <div className="h-5 w-20 bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-20 bg-gray-800 rounded mb-1 animate-pulse" />
              <div className="h-5 w-16 bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="text-right">
              <div className="h-8 w-12 bg-gray-800 rounded mb-1 animate-pulse" />
              <div className="h-4 w-16 bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </header>

        {/* Progress bar skeleton */}
        <div className="mb-6">
          <div className="w-full h-2 bg-gray-800 rounded-full animate-pulse" />
        </div>

        {/* Exercise list skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
