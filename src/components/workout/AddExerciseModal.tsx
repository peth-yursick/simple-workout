'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { MainExerciseStar } from '@/components/exercise/MainExerciseStar'
import { ToughnessRating } from '@/components/exercise/ToughnessRating'
import { ExerciseLibrary } from '@/lib/types/database'
import { searchExercises } from '@/lib/api/exercise-library'
import { createClient } from '@/lib/supabase/client'
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
  const [selectedLibraryExercise, setSelectedLibraryExercise] = useState<ExerciseLibrary | null>(null)
  const [suggestions, setSuggestions] = useState<ExerciseLibrary[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch suggestions as user types
  useEffect(() => {
    if (name.trim().length < 1) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      try {
        const supabase = await createClient()
        const results = await searchExercises(supabase, name.trim())
        setSuggestions(results.slice(0, 8))
      } catch {
        setSuggestions([])
      }
    }

    const timer = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(timer)
  }, [name])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectSuggestion = (exercise: ExerciseLibrary) => {
    setName(exercise.name)
    setSelectedLibraryExercise(exercise)
    setShowSuggestions(false)
    if (exercise.weight_direction === 'decrease') {
      setWeightKg('0')
    }
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
        exercise_library_id: selectedLibraryExercise?.id || null,
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
          {/* Exercise name with inline autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setSelectedLibraryExercise(null)
                setShowSuggestions(true)
              }}
              onFocus={() => name.trim().length > 0 && setShowSuggestions(true)}
              placeholder="e.g. Bench Press"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              autoComplete="off"
            />
            {/* Inline suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && !selectedLibraryExercise && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg max-h-48 overflow-y-auto"
              >
                {suggestions.map(exercise => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(exercise)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors flex items-center justify-between"
                  >
                    <span className="text-white text-sm">{exercise.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{exercise.equipment}</span>
                  </button>
                ))}
              </div>
            )}
            {/* Library indicator */}
            {selectedLibraryExercise && (
              <div className="mt-2 flex items-center gap-2 text-xs text-green-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Selected from library</span>
                <button
                  type="button"
                  onClick={() => setSelectedLibraryExercise(null)}
                  className="text-gray-500 hover:text-gray-300"
                >
                  Clear
                </button>
              </div>
            )}
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

      </div>
    </div>
  )
}
