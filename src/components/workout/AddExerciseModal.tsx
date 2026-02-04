'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
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
  const [isLoading, setIsLoading] = useState(false)

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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl max-w-sm w-full p-6 border border-gray-800" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Add Exercise</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bench Press"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

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

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={isLoading} disabled={!name.trim()}>
              Add
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
