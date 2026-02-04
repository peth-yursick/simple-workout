'use client'

interface ProgressBarProps {
  value: number // 0-100
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'yellow' | 'purple'
  showLabel?: boolean
  label?: string
  animated?: boolean
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

const colorStyles = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'blue',
  showLabel = false,
  label,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-gray-300">{label}</span>}
          {showLabel && <span className="text-sm text-gray-400">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`
            h-full rounded-full
            ${colorStyles[color]}
            ${animated ? 'transition-all duration-500 ease-out' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Specialized level progress bar - progress based on weight increases
interface LevelProgressBarProps {
  level: number
  progress: number // 0-100 percentage progress within current level
  title?: string
}

export function LevelProgressBar({ level, progress, title }: LevelProgressBarProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">{level}</span>
          </div>
          <p className="text-sm text-white">
            Level {level}
            {title && <span className="text-gray-500"> · {title}</span>}
          </p>
        </div>
        <p className="text-sm font-medium text-white">{Math.round(progress)}%</p>
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
