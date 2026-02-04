'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Exercise } from '@/lib/types/database'
import { MainExerciseStar } from '@/components/exercise/MainExerciseStar'
import { ToughnessRating } from '@/components/exercise/ToughnessRating'
import { updateExercise, deleteExercise } from '@/app/actions/workout-actions'

interface EditExerciseModalProps {
  exercise: Exercise
  workoutId: string
  onClose: () => void
  onSuccess: () => void
}

export function EditExerciseModal({ exercise, workoutId, onClose, onSuccess }: EditExerciseModalProps) {
  const [name, setName] = useState(exercise.name)
  const [sets, setSets] = useState(String(exercise.sets))
  const [weightKg, setWeightKg] = useState(String(exercise.weight_kg))
  const [repMin, setRepMin] = useState(String(exercise.rep_min))
  const [repMax, setRepMax] = useState(String(exercise.rep_max))
  const [isMainExercise, setIsMainExercise] = useState(exercise.is_main_exercise ?? false)
  const [toughnessRating, setToughnessRating] = useState(exercise.toughness_rating ?? 1)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      await updateExercise(exercise.id, workoutId, {
        name: name.trim(),
        sets: Number(sets) || 1,
        weight_kg: Number(weightKg) || 0,
        rep_min: Number(repMin) || 1,
        rep_max: Number(repMax) || 1,
        is_main_exercise: isMainExercise,
        toughness_rating: toughnessRating,
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to update exercise:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteExercise(exercise.id, workoutId)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to delete exercise:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Show delete confirmation view
  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowDeleteConfirm(false)}>
        <div className="bg-gray-900 rounded-2xl max-w-sm w-full p-6 border border-gray-800" onClick={e => e.stopPropagation()}>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Delete Exercise?</h2>
            <p className="text-gray-400 mb-6">This will permanently delete &ldquo;{exercise.name}&rdquo;</p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                onClick={handleDelete}
                loading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 overflow-y-auto flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl max-w-sm w-full p-6 border border-gray-800 my-8" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Edit Exercise</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Exercise name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
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
            <Button type="button" variant="danger" onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={isLoading} disabled={!name.trim()}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
