'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ExerciseLibrary, ExerciseCategory, MovementType, EquipmentType } from '@/lib/types/database'
import { searchExercises, getExercisesByCategory, getExercisesByMovementType, getExercisesByEquipment } from '@/lib/api/exercise-library'
import { createClient } from '@/lib/supabase/client'

interface ExerciseLibraryModalProps {
  onClose: () => void
  onSelectExercise: (exercise: ExerciseLibrary) => void
}

const CATEGORY_OPTIONS: { value: ExerciseCategory; label: string }[] = [
  { value: 'compound', label: 'Compound' },
  { value: 'isolation', label: 'Isolation' },
  { value: 'accessory', label: 'Accessory' }
]

const MOVEMENT_OPTIONS: { value: MovementType; label: string }[] = [
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
  { value: 'legs', label: 'Legs' },
  { value: 'core', label: 'Core' }
]

const EQUIPMENT_OPTIONS: { value: EquipmentType; label: string }[] = [
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'machine', label: 'Machine' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'cable', label: 'Cable' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'band', label: 'Band' },
  { value: 'other', label: 'Other' }
]

export function ExerciseLibraryModal({ onClose, onSelectExercise }: ExerciseLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all')
  const [selectedMovement, setSelectedMovement] = useState<MovementType | 'all'>('all')
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'all'>('all')
  const [exercises, setExercises] = useState<ExerciseLibrary[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch exercises when filters change
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true)
      try {
        const supabase = await createClient()
        let results: ExerciseLibrary[]

        if (searchQuery.trim()) {
          results = await searchExercises(supabase, searchQuery)
        } else if (selectedCategory !== 'all') {
          results = await getExercisesByCategory(supabase, selectedCategory)
        } else if (selectedMovement !== 'all') {
          results = await getExercisesByMovementType(supabase, selectedMovement)
        } else if (selectedEquipment !== 'all') {
          results = await getExercisesByEquipment(supabase, selectedEquipment)
        } else {
          const { data } = await supabase.from('exercise_library').select('*').order('name')
          results = (data as ExerciseLibrary[]) || []
        }

        // Apply additional filters client-side
        let filtered = results
        if (selectedCategory !== 'all') {
          filtered = filtered.filter(e => e.category === selectedCategory)
        }
        if (selectedMovement !== 'all') {
          filtered = filtered.filter(e => e.movement_type === selectedMovement)
        }
        if (selectedEquipment !== 'all') {
          filtered = filtered.filter(e => e.equipment === selectedEquipment)
        }

        setExercises(filtered)
      } catch (error) {
        console.error('Failed to fetch exercises:', error)
        setExercises([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchExercises, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, selectedCategory, selectedMovement, selectedEquipment])

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Exercise Library</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full px-4 py-3 pl-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex flex-wrap gap-3">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as ExerciseCategory | 'all')}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Movement Filter */}
            <select
              value={selectedMovement}
              onChange={e => setSelectedMovement(e.target.value as MovementType | 'all')}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Movements</option>
              {MOVEMENT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Equipment Filter */}
            <select
              value={selectedEquipment}
              onChange={e => setSelectedEquipment(e.target.value as EquipmentType | 'all')}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Equipment</option>
              {EQUIPMENT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Clear Filters */}
            {(selectedCategory !== 'all' || selectedMovement !== 'all' || selectedEquipment !== 'all' || searchQuery) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setSelectedMovement('all')
                  setSelectedEquipment('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Exercise List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading exercises...</div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-2">No exercises found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exercises.map(exercise => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onSelect={() => {
                    onSelectExercise(exercise)
                    onClose()
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ExerciseCard({ exercise, onSelect }: { exercise: ExerciseLibrary; onSelect: () => void }) {
  const categoryColors = {
    compound: 'bg-blue-900/30 text-blue-400',
    isolation: 'bg-purple-900/30 text-purple-400',
    accessory: 'bg-green-900/30 text-green-400'
  }

  const movementColors = {
    push: 'bg-orange-900/30 text-orange-400',
    pull: 'bg-cyan-900/30 text-cyan-400',
    legs: 'bg-red-900/30 text-red-400',
    core: 'bg-yellow-900/30 text-yellow-400'
  }

  return (
    <button
      onClick={onSelect}
      className="text-left p-4 bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700 hover:border-gray-600 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">{exercise.name}</h3>
        <div className="flex gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${categoryColors[exercise.category]}`}>
            {exercise.category}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded ${movementColors[exercise.movement_type]}`}>
            {exercise.movement_type}
          </span>
        </div>
      </div>

      {/* Equipment */}
      <p className="text-sm text-gray-400 mb-3 capitalize">
        {exercise.equipment.replace('_', ' ')}
      </p>

      {/* Primary Muscles */}
      {exercise.primary_muscles.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-gray-500 mb-1">Primary:</p>
          <div className="flex flex-wrap gap-1">
            {exercise.primary_muscles.map(m => (
              <span key={m.muscle} className="px-2 py-0.5 text-xs bg-red-900/30 text-red-400 rounded">
                {m.muscle} ({m.activation}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Secondary Muscles */}
      {exercise.secondary_muscles.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Secondary:</p>
          <div className="flex flex-wrap gap-1">
            {exercise.secondary_muscles.map(m => (
              <span key={m.muscle} className="px-2 py-0.5 text-xs bg-orange-900/30 text-orange-400 rounded">
                {m.muscle} ({m.activation}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Aliases */}
      {exercise.aliases.length > 0 && (
        <p className="text-xs text-gray-500 mt-3">
          Also known as: {exercise.aliases.join(', ')}
        </p>
      )}
    </button>
  )
}
