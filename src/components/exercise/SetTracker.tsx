'use client'

import { useState } from 'react'
import { ExerciseSet, Exercise } from '@/lib/types/database'
import { Button } from '@/components/ui/Button'
import { EffortInput } from './EffortInput'

interface SetTrackerProps {
  set: ExerciseSet
  exercise: Exercise
  onComplete: (reps: number, effort: number) => void
  onSkip: () => void
  loading?: boolean
}

export function SetTracker({ set, exercise, onComplete, onSkip, loading }: SetTrackerProps) {
  const [reps, setReps] = useState(set.reps_completed ?? exercise.rep_max)
  const [effort, setEffort] = useState(set.effort_percentage ?? 80)

  const isCompleted = set.completed_at !== null
  const isSkipped = set.skipped

  const handleComplete = () => {
    if (loading) return
    onComplete(reps, effort)
  }

  const handleSkip = () => {
    if (loading) return
    onSkip()
  }

  if (isCompleted || isSkipped) {
    return (
      <div className={`p-6 rounded-xl ${isSkipped ? 'bg-red-950/50' : 'bg-green-950/50'}`}>
        <div className="text-center">
          <p className="text-lg font-medium text-white">
            Set {set.set_number} {isSkipped ? 'Skipped' : 'Complete'}
          </p>
          {isCompleted && (
            <p className="text-gray-400 mt-2">
              {set.reps_completed} reps @ {set.effort_percentage}% effort
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
      <h3 className="text-xl font-semibold text-center text-white mb-6">
        Set {set.set_number} of {exercise.sets}
      </h3>

      {/* Reps selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 text-center mb-3">
          Reps completed
        </label>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setReps(r => Math.max(0, r - 1))}
            disabled={reps <= 0}
          >
            -
          </Button>
          <span className="text-4xl font-bold w-16 text-center text-white">{reps}</span>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setReps(r => r + 1)}
          >
            +
          </Button>
        </div>
        <p className="text-sm text-gray-500 text-center mt-2">
          Target: {exercise.rep_min}-{exercise.rep_max} reps
        </p>
      </div>

      {/* Effort input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 text-center mb-3">
          Effort level
        </label>
        <EffortInput
          value={effort}
          onChange={setEffort}
          targetMin={exercise.target_effort_min}
          targetMax={exercise.target_effort_max}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={handleSkip}
          disabled={loading}
        >
          Skip Set
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={handleComplete}
          loading={loading}
        >
          Complete Set
        </Button>
      </div>
    </div>
  )
}
