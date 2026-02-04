'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Workout, Exercise } from '@/lib/types/database'
import { DayNameEditor } from './DayNameEditor'
import { ExerciseList } from './ExerciseList'
import { SkipDayButton } from './SkipDayButton'
import { updateWorkout } from '@/app/actions/workout-actions'

interface WorkoutHeaderProps {
  workout: Workout
  exercises: Exercise[]
  doneCount: number
  totalCount: number
}

export function WorkoutHeader({ workout, exercises, doneCount, totalCount }: WorkoutHeaderProps) {
  const [editMode, setEditMode] = useState(false)

  const handleSaveDayName = async (name: string) => {
    try {
      await updateWorkout(workout.id, { day_name: name })
    } catch (error) {
      console.error('Failed to update day name:', error)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Week
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`text-sm font-medium transition-colors ${
                editMode ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {editMode ? 'Done Editing' : 'Edit Exercises'}
            </button>
            {!workout.completed_at && !workout.skipped_at && (
              <SkipDayButton workoutId={workout.id} />
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              <DayNameEditor
                dayName={workout.day_name}
                dayNumber={workout.day_number}
                onSave={handleSaveDayName}
              />
            </h1>
            <p className="text-gray-400">Week {workout.week_number}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{doneCount}/{totalCount}</p>
            <p className="text-sm text-gray-500">exercises</p>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Exercise list with drag-to-reorder */}
      <ExerciseList exercises={exercises} workoutId={workout.id} editMode={editMode} />
    </>
  )
}
