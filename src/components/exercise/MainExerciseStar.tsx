'use client'

interface MainExerciseStarProps {
  isMain: boolean
  onToggle: () => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export function MainExerciseStar({ isMain, onToggle, size = 'md', disabled = false }: MainExerciseStarProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        ${sizeClasses[size]} rounded-full flex items-center justify-center transition-all
        ${isMain
          ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500'
          : 'bg-gray-800 text-gray-600 border-2 border-gray-700 hover:border-gray-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={isMain ? 'Main exercise - Click to remove' : 'Mark as main exercise'}
    >
      <svg
        className={iconSizes[size]}
        fill={isMain ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.78.57-.818-.196 1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    </button>
  )
}
