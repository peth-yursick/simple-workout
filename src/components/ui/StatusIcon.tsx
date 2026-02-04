import { ExerciseStatus } from '@/lib/types/database'

interface StatusIconProps {
  status: ExerciseStatus
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export function StatusIcon({ status, size = 'md' }: StatusIconProps) {
  const sizeClass = sizeClasses[size]

  if (status === 'complete') {
    return (
      <svg className={`${sizeClass} text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )
  }

  if (status === 'skipped') {
    return (
      <svg className={`${sizeClass} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  }

  // incomplete - empty circle
  return (
    <svg className={`${sizeClass} text-gray-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
    </svg>
  )
}
