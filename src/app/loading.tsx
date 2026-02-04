export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-8 text-center">
          <div className="h-5 w-32 bg-gray-800 rounded mx-auto mb-2 animate-pulse" />
          <div className="h-10 w-24 bg-gray-800 rounded mx-auto animate-pulse" />
        </div>

        {/* Edit button skeleton */}
        <div className="flex justify-end mb-3">
          <div className="w-9 h-9 bg-gray-800 rounded-lg animate-pulse" />
        </div>

        {/* Level progress skeleton */}
        <div className="h-16 bg-gray-800 rounded-xl mb-6 animate-pulse" />

        {/* Day cards skeleton */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
