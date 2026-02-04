'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Exercise } from '@/lib/types/database'
import { DraggableExercise } from './DraggableExercise'
import { AddExerciseModal } from './AddExerciseModal'
import { EditExerciseModal } from './EditExerciseModal'
import { reorderExercises } from '@/app/actions/workout-actions'

interface ExerciseListProps {
  exercises: Exercise[]
  workoutId: string
  editMode?: boolean
}

export function ExerciseList({ exercises: initialExercises, workoutId, editMode = false }: ExerciseListProps) {
  const router = useRouter()
  const [exercises, setExercises] = useState(initialExercises)
  const [isReordering, setIsReordering] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)

  // Sync exercises state when props change (e.g., after adding/deleting)
  useEffect(() => {
    setExercises(initialExercises)
  }, [initialExercises])

  // In edit mode, make dragging immediate (no delay)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: editMode ? 5 : 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: editMode
        ? { distance: 5 }
        : { delay: 250, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = exercises.findIndex(e => e.id === active.id)
      const newIndex = exercises.findIndex(e => e.id === over.id)

      const newExercises = arrayMove(exercises, oldIndex, newIndex)
      setExercises(newExercises)

      // Update order in database
      setIsReordering(true)
      try {
        await reorderExercises(workoutId, newExercises.map(e => e.id))
      } catch (error) {
        // Revert on error
        setExercises(exercises)
        console.error('Failed to reorder exercises:', error)
      } finally {
        setIsReordering(false)
      }
    }
  }

  const handleSuccess = () => {
    router.refresh()
  }

  if (exercises.length === 0) {
    return (
      <div>
        <div className="text-center py-12">
          <p className="text-gray-400">No exercises yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            Tap + to add your first exercise.
          </p>
        </div>

        {/* Add exercise button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full p-6 rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-600 hover:bg-gray-900/50 transition-all"
        >
          <span className="text-4xl text-gray-500">+</span>
        </button>

        {showAddModal && (
          <AddExerciseModal
            workoutId={workoutId}
            onClose={() => setShowAddModal(false)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    )
  }

  return (
    <div className={isReordering ? 'opacity-70 pointer-events-none' : ''}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exercises.map(e => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {exercises.map((exercise) => (
              <DraggableExercise
                key={exercise.id}
                exercise={exercise}
                workoutId={workoutId}
                editMode={editMode}
                onEdit={() => setEditingExercise(exercise)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add exercise button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full mt-3 p-6 rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-600 hover:bg-gray-900/50 transition-all"
      >
        <span className="text-4xl text-gray-500">+</span>
      </button>

      {showAddModal && (
        <AddExerciseModal
          workoutId={workoutId}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {editingExercise && (
        <EditExerciseModal
          exercise={editingExercise}
          workoutId={workoutId}
          onClose={() => setEditingExercise(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
