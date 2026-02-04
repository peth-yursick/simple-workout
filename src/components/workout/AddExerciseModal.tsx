'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { MainExerciseStar } from '@/components/exercise/MainExerciseStar'
import { ToughnessRating } from '@/components/exercise/ToughnessRating'
import { ExerciseLibraryModal } from '@/components/exercise/ExerciseLibraryModal'
import { ExerciseLibrary } from '@/lib/types/database'
import { createExercise } from '@/app/actions/workout-actions'

interface AddExerciseModalProps {
  workoutId: string
  onClose: () => void
  onSuccess: () => void
}

export function AddExerciseModal({ workoutId, onClose, onSuccess }: AddExerciseModalProps) {
  const [name, setName] = useState('')
  const [sets, setSets] = useState('3')
  const [weightKg, setWeightKg] = useState('20')
  const [repMin, setRepMin] = useState('6')
  const [repMax, setRepMax] = useState('10')
  const [isMainExercise, setIsMainExercise] = useState(false)
  const [toughnessRating, setToughnessRating] = useState(3)
  const [isLoading, setIsLoading] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)

  const handleSelectFromLibrary = (exercise: ExerciseLibrary) => {
    setName(exercise.name)
    // Set defaults based on exercise library data
    if (exercise.weight_direction === 'decrease') {
      setWeightKg('0') // Bodyweight exercises
    }
    setShowLibrary(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      await createExercise({
        workout_id: workoutId,
        name: name.trim(),
        sets: Number(sets) || 3,
        weight_kg: Number(weightKg) || 0,
        rep_min: Number(repMin) || 6,
        rep_max: Number(repMax) || 10,
        target_effort_min: 70,
        target_effort_max: 80,
        is_main_exercise: isMainExercise,
        toughness_rating: toughnessRating,
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to create exercise:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 overflow-y-auto flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl max-w-sm w-full p-6 border border-gray-800 my-8" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Add Exercise</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Exercise name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bench Press"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowLibrary(true)}
                title="Browse exercise library"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Main Exercise & Toughness Section */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Main Exercise
                </label>
                <div className="flex items-center gap-2">
                  <MainExerciseStar
                    isMain={isMainExercise}
                    onToggle={() => setIsMainExercise(!isMainExercise)}
                    size="md"
                  />
                  <span className="text-sm text-gray-400">
                    {isMainExercise ? 'Marked as important' : 'Mark as key exercise'}
                  </span>
                </div>
              </div>

              <div className="flex-1 ml-4">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Toughness
                </label>
                <ToughnessRating
                  value={toughnessRating}
                  onChange={setToughnessRating}
                />
              </div>
            </div>
          </div>

          {/* Sets and Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sets</label>
              <input
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                min={1}
                max={9}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                min={0}
                max={500}
                step={0.5}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rep ranges */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Min Reps</label>
              <input
                type="number"
                value={repMin}
                onChange={(e) => setRepMin(e.target.value)}
                min={1}
                max={50}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Max Reps</label>
              <input
                type="number"
                value={repMax}
                onChange={(e) => setRepMax(e.target.value)}
                min={1}
                max={50}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={isLoading} disabled={!name.trim()}>
              Add
            </Button>
          </div>
        </form>

        {/* Exercise Library Modal */}
        {showLibrary && (
          <ExerciseLibraryModal
            onClose={() => setShowLibrary(false)}
            onSelectExercise={handleSelectFromLibrary}
          />
        )}
      </div>
    </div>
  )
}
