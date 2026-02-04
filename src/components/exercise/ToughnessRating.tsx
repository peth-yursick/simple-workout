'use client'

interface ToughnessRatingProps {
  value: number // 1-5
  onChange: (value: number) => void
  disabled?: boolean
}

export function ToughnessRating({ value, onChange, disabled = false }: ToughnessRatingProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Stars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => !disabled && onChange(rating)}
            disabled={disabled}
            className={`
              w-8 h-8 rounded-lg flex items-center justify-center transition-all
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${rating <= value
                ? 'bg-red-900/50 text-red-400 border border-red-700'
                : 'bg-gray-800 text-gray-600 border border-gray-700'
              }
            `}
            title={`${rating} - ${getToughnessLabel(rating)}`}
          >
            <svg
              className="w-4 h-4"
              fill={rating <= value ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </button>
        ))}
      </div>

      {/* Label */}
      <p className="text-xs text-gray-500 mt-2">
        {value > 0 ? getToughnessLabel(value) : 'Not rated'}
      </p>
    </div>
  )
}

function getToughnessLabel(rating: number): string {
  switch (rating) {
    case 1:
      return 'Very Easy'
    case 2:
      return 'Easy'
    case 3:
      return 'Moderate'
    case 4:
      return 'Hard'
    case 5:
      return 'Very Hard'
    default:
      return ''
  }
}
