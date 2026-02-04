'use client'

import Link from 'next/link'
import { Exercise } from '@/lib/types/database'
import { StatusIcon } from '@/components/ui/StatusIcon'

interface ExerciseCardProps {
  exercise: Exercise
  workoutId: string
}

export function ExerciseCard({ exercise, workoutId }: ExerciseCardProps) {
  return (
    <Link href={`/workout/${workoutId}/exercise/${exercise.id}`}>
      <div className={`
        p-4 rounded-lg border transition-all duration-200
        ${exercise.status === 'complete'
          ? 'bg-green-950/50 border-green-800'
          : exercise.status === 'skipped'
            ? 'bg-red-950/50 border-red-800'
            : 'bg-gray-900 border-gray-800 hover:border-blue-700 hover:bg-gray-800/50'
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-white">{exercise.name}</h3>
            <p className="text-sm text-gray-400 mt-1">
              {exercise.sets} sets &middot; {exercise.rep_min}-{exercise.rep_max} reps &middot; {exercise.weight_kg}kg
            </p>
          </div>
          <StatusIcon status={exercise.status} size="lg" />
        </div>
      </div>
    </Link>
  )
}
