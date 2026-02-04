'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Workout, ExerciseWithSets } from '@/lib/types/database'
import { Button } from '@/components/ui/Button'
import { SetTracker } from '@/components/exercise/SetTracker'
import { RestTimer } from '@/components/exercise/RestTimer'
import { completeSet, skipSet, skipExercise } from '@/app/actions/workout-actions'

interface ExerciseTrackerProps {
  workout: Workout
  exercise: ExerciseWithSets
  nextExerciseId?: string
  incompleteCount: number
}

export function ExerciseTracker({ workout, exercise, nextExerciseId, incompleteCount }: ExerciseTrackerProps) {
  const router = useRouter()

  // Track optimistically completed/skipped sets locally
  const [optimisticSets, setOptimisticSets] = useState<Record<string, 'completed' | 'skipped'>>({})

  const [currentSetIndex, setCurrentSetIndex] = useState(() => {
    // Find first incomplete set
    const index = exercise.exercise_sets.findIndex(
      s => !s.completed_at && !s.skipped
    )
    return index >= 0 ? index : 0
  })
  const [isSkipping, setIsSkipping] = useState(false)
  const [isCompletingFinal, setIsCompletingFinal] = useState(false)
  const [showRestTimer, setShowRestTimer] = useState(false)

  const currentSet = exercise.exercise_sets[currentSetIndex]
  const totalSets = exercise.exercise_sets.length

  // Count completed sets including optimistic updates
  const completedSets = exercise.exercise_sets.filter(s =>
    s.completed_at || s.skipped || optimisticSets[s.id]
  ).length

  // Navigate after completing/skipping an exercise
  const navigateAfterExerciseDone = () => {
    if (incompleteCount === 0) {
      // This was the last incomplete exercise, go to congrats
      router.push(`/workout/${workout.id}/complete`)
    } else if (nextExerciseId) {
      // Go to next incomplete exercise
      router.push(`/workout/${workout.id}/exercise/${nextExerciseId}`)
    } else {
      // Fallback to workout page
      router.push(`/workout/${workout.id}`)
    }
    router.refresh()
  }

  const handleCompleteSet = async (reps: number, effort: number) => {
    const isFinalSet = currentSetIndex >= totalSets - 1

    // Optimistically mark set as completed
    setOptimisticSets(prev => ({ ...prev, [currentSet.id]: 'completed' }))

    if (isFinalSet) {
      // For final set, wait for server action to complete before navigating
      setIsCompletingFinal(true)
      await completeSet(currentSet.id, exercise.id, workout.id, reps, effort)
      navigateAfterExerciseDone()
    } else {
      // For intermediate sets, fire and show rest timer
      completeSet(currentSet.id, exercise.id, workout.id, reps, effort)
      setShowRestTimer(true)
    }
  }

  const handleRestTimerFinish = useCallback(() => {
    setShowRestTimer(false)
    setCurrentSetIndex(prev => prev + 1)
  }, [])

  const handleSkipSet = async () => {
    const isFinalSet = currentSetIndex >= totalSets - 1

    // Optimistically mark set as skipped
    setOptimisticSets(prev => ({ ...prev, [currentSet.id]: 'skipped' }))

    if (isFinalSet) {
      // For final set, wait for server action to complete before navigating
      setIsCompletingFinal(true)
      await skipSet(currentSet.id, exercise.id, workout.id)
      navigateAfterExerciseDone()
    } else {
      // For intermediate sets, fire and move on immediately
      skipSet(currentSet.id, exercise.id, workout.id)
      setCurrentSetIndex(currentSetIndex + 1)
    }
  }

  const handleSkipExercise = async () => {
    setIsSkipping(true)
    try {
      await skipExercise(exercise.id, workout.id)
      navigateAfterExerciseDone()
    } finally {
      setIsSkipping(false)
    }
  }

  const handleBack = () => {
    // Go back to workout page (exercise list)
    router.push(`/workout/${workout.id}`)
  }

  if (showRestTimer) {
    return <RestTimer onFinish={handleRestTimerFinish} />
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <Link
            href={`/workout/${workout.id}`}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mb-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Workout
          </Link>
          <h1 className="text-xl font-bold text-white">{exercise.name}</h1>
          <p className="text-gray-400 text-sm">
            {exercise.weight_kg}kg &middot; {exercise.rep_min}-{exercise.rep_max} reps &middot; {totalSets} sets
          </p>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-gray-900 px-4 py-3 border-b border-gray-800">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{completedSets}/{totalSets} sets</span>
          </div>
          <div className="flex gap-1">
            {exercise.exercise_sets.map((set, i) => {
              const optimisticStatus = optimisticSets[set.id]
              const isCompleted = set.completed_at || optimisticStatus === 'completed'
              const isSkipped = set.skipped || optimisticStatus === 'skipped'

              return (
                <div
                  key={set.id}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    isCompleted
                      ? 'bg-green-500'
                      : isSkipped
                        ? 'bg-red-400'
                        : i === currentSetIndex
                          ? 'bg-blue-500'
                          : 'bg-gray-700'
                  }`}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto">
          {currentSet && (
            <SetTracker
              key={currentSet.id}
              set={currentSet}
              exercise={exercise}
              onComplete={handleCompleteSet}
              onSkip={handleSkipSet}
              loading={isCompletingFinal}
            />
          )}
        </div>
      </main>

      {/* Bottom navigation */}
      <footer className="bg-gray-900 border-t border-gray-800 px-4 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex-1"
          >
            &larr; Back
          </Button>
          <Button
            variant="secondary"
            onClick={handleSkipExercise}
            loading={isSkipping}
            className="flex-1"
          >
            Skip Exercise
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (nextExerciseId) {
                router.push(`/workout/${workout.id}/exercise/${nextExerciseId}`)
              } else {
                router.push(`/workout/${workout.id}`)
              }
            }}
            className="flex-1"
          >
            Next Exercise →
          </Button>
        </div>
      </footer>
    </div>
  )
}
