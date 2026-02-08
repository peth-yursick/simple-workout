'use client'

import Link from 'next/link'
import { Workout } from '@/lib/types/database'

interface DayCardProps {
  workout: Workout
  exerciseCount: number
  completedCount: number
  hasSkipped?: boolean
}

export function DayCard({ workout, exerciseCount, completedCount, hasSkipped = false }: DayCardProps) {
  const isComplete = workout.completed_at !== null
  const isDaySkipped = workout.skipped_at !== null
  const progress = exerciseCount > 0 ? (completedCount / exerciseCount) * 100 : 0

  // Determine color scheme:
  // - Red if entire day was skipped
  // - Orange if completed with some exercises skipped
  // - Green if fully completed
  // - Gray if incomplete
  const getColorScheme = () => {
    if (isDaySkipped) {
      return { bg: 'bg-red-950/50', border: 'border-red-800 hover:border-red-700', bar: 'bg-red-500', badge: 'text-red-400 bg-red-900/50', badgeText: 'Skipped' }
    }
    if (isComplete) {
      if (hasSkipped) {
        return { bg: 'bg-orange-950/50', border: 'border-orange-800 hover:border-orange-700', bar: 'bg-orange-500', badge: 'text-orange-400 bg-orange-900/50', badgeText: 'Done' }
      }
      return { bg: 'bg-green-950/50', border: 'border-green-800 hover:border-green-700', bar: 'bg-green-500', badge: 'text-green-400 bg-green-900/50', badgeText: 'Complete' }
    }
    return { bg: 'bg-gray-900', border: 'border-gray-800 hover:border-gray-700 hover:bg-gray-800/50', bar: 'bg-blue-500', badge: '', badgeText: '' }
  }

  const colorScheme = getColorScheme()

  return (
    <Link href={`/workout/${workout.id}`}>
      <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${colorScheme.bg} ${colorScheme.border}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {workout.day_name || `Day ${workout.day_number}`}
            </h3>
            {!workout.day_name && (
              <p className="text-xs text-gray-500 mt-0.5">Week {workout.week_number}</p>
            )}
          </div>
          {(isComplete || isDaySkipped) && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorScheme.badge}`}>
              {colorScheme.badgeText}
            </span>
          )}
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>{completedCount} / {exerciseCount} exercises</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${colorScheme.bar}`}
              style={{ width: `${isDaySkipped ? 100 : progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
