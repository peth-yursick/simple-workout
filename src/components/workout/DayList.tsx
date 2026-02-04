'use client'

import { useState, useEffect } from 'react'
import { Workout } from '@/lib/types/database'
import { DayCard } from './DayCard'
import { AddDayModal } from './AddDayModal'
import { SpreadsheetUpload } from '@/components/import/SpreadsheetUpload'

interface WorkoutWithProgress {
  workout: Workout
  exerciseCount: number
  completedCount: number
  hasSkipped: boolean
}

interface DayListProps {
  workoutsWithProgress: WorkoutWithProgress[]
  currentWeek: number
  programId?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DayList({ workoutsWithProgress, currentWeek, programId }: DayListProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Read edit mode from localStorage
  useEffect(() => {
    const checkEditMode = () => {
      const saved = localStorage.getItem('editMode')
      setEditMode(saved === 'true')
    }
    checkEditMode()

    window.addEventListener('storage', checkEditMode)
    window.addEventListener('editModeChanged', checkEditMode)
    window.addEventListener('focus', checkEditMode)

    return () => {
      window.removeEventListener('storage', checkEditMode)
      window.removeEventListener('editModeChanged', checkEditMode)
      window.removeEventListener('focus', checkEditMode)
    }
  }, [])

  // Calculate next day number
  const maxDayNumber = workoutsWithProgress.reduce(
    (max, { workout }) => Math.max(max, workout.day_number),
    0
  )
  const nextDayNumber = maxDayNumber + 1

  return (
    <div>
      <div className="flex flex-col gap-3">
        {workoutsWithProgress.map(({ workout, exerciseCount, completedCount, hasSkipped }) => (
          <DayCard
            key={workout.id}
            workout={workout}
            exerciseCount={exerciseCount}
            completedCount={completedCount}
            hasSkipped={hasSkipped}
          />
        ))}
      </div>

      {/* Add day button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full mt-3 p-6 rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-600 hover:bg-gray-900/50 transition-all"
      >
        <span className="text-4xl text-gray-500">+</span>
      </button>

      {/* Upload routine - only in edit mode */}
      {editMode && (
        <div className="mt-3">
          <SpreadsheetUpload onClose={() => {}} />
        </div>
      )}

      {showAddModal && (
        <AddDayModal
          weekNumber={currentWeek}
          nextDayNumber={nextDayNumber}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
