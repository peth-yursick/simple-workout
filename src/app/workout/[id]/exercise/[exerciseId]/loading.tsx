export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header skeleton */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="h-5 w-28 bg-gray-800 rounded mb-2 animate-pulse" />
          <div className="h-7 w-40 bg-gray-800 rounded mb-1 animate-pulse" />
          <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
        </div>
      </header>

      {/* Progress skeleton */}
      <div className="bg-gray-900 px-4 py-3 border-b border-gray-800">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between mb-2">
            <div className="h-4 w-16 bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-12 bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-2 bg-gray-800 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <div className="h-7 w-24 bg-gray-800 rounded mx-auto mb-6 animate-pulse" />

            {/* Reps skeleton */}
            <div className="mb-8">
              <div className="h-4 w-28 bg-gray-800 rounded mx-auto mb-3 animate-pulse" />
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-lg animate-pulse" />
                <div className="w-16 h-12 bg-gray-800 rounded animate-pulse" />
                <div className="w-12 h-12 bg-gray-800 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Effort skeleton */}
            <div className="mb-8">
              <div className="h-4 w-24 bg-gray-800 rounded mx-auto mb-3 animate-pulse" />
              <div className="h-12 w-32 bg-gray-800 rounded mx-auto mb-4 animate-pulse" />
              <div className="h-3 w-full bg-gray-800 rounded-lg animate-pulse" />
            </div>

            {/* Buttons skeleton */}
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gray-800 rounded-lg animate-pulse" />
              <div className="flex-1 h-12 bg-gray-800 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer skeleton */}
      <footer className="bg-gray-900 border-t border-gray-800 px-4 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <div className="flex-1 h-12 bg-gray-800 rounded-lg animate-pulse" />
          <div className="flex-1 h-12 bg-gray-800 rounded-lg animate-pulse" />
          <div className="flex-1 h-12 bg-gray-800 rounded-lg animate-pulse" />
        </div>
      </footer>
    </div>
  )
}
