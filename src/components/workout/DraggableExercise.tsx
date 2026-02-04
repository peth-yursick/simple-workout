'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { Exercise } from '@/lib/types/database'
import { StatusIcon } from '@/components/ui/StatusIcon'

interface DraggableExerciseProps {
  exercise: Exercise
  workoutId: string
  editMode?: boolean
  onEdit?: () => void
}

export function DraggableExercise({ exercise, workoutId, editMode, onEdit }: DraggableExerciseProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // In edit mode, the whole row is draggable and tap opens edit
  // In normal mode, only the handle is draggable and tap opens exercise

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    if (editMode) {
      onEdit?.()
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(editMode ? { ...attributes, ...listeners } : {})}
      className={`
        flex items-center gap-3 p-4 rounded-lg border transition-all duration-200
        ${isDragging ? 'shadow-lg z-10 opacity-90' : ''}
        ${editMode ? 'cursor-grab active:cursor-grabbing' : ''}
        ${editMode ? 'border-blue-600/50 bg-gray-900' : ''}
        ${!editMode && exercise.status === 'complete'
          ? 'bg-green-950/50 border-green-800'
          : !editMode && exercise.status === 'skipped'
            ? 'bg-red-950/50 border-red-800'
            : !editMode ? 'bg-gray-900 border-gray-800' : ''
        }
      `}
    >
      {/* Drag handle - only shown in normal mode */}
      {!editMode && (
        <button
          {...attributes}
          {...listeners}
          className="touch-none p-1 -m-1 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
      )}

      {/* Edit mode indicator */}
      {editMode && (
        <div className="text-blue-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      )}

      {/* Exercise content */}
      {editMode ? (
        <button
          onClick={handleTap}
          className="flex-1 min-w-0 text-left"
        >
          <h3 className="font-medium text-white truncate">{exercise.name}</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {exercise.sets} sets &middot; {exercise.rep_min}-{exercise.rep_max} reps &middot; {exercise.weight_kg}kg
          </p>
        </button>
      ) : (
        <Link
          href={`/workout/${workoutId}/exercise/${exercise.id}`}
          className="flex-1 min-w-0 touch-manipulation"
        >
          <h3 className="font-medium text-white truncate">{exercise.name}</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {exercise.sets} sets &middot; {exercise.rep_min}-{exercise.rep_max} reps &middot; {exercise.weight_kg}kg
          </p>
        </Link>
      )}

      {/* Status icon / Edit icon */}
      {editMode ? (
        <button onClick={handleTap} className="text-blue-400 hover:text-blue-300">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      ) : (
        <StatusIcon status={exercise.status} size="lg" />
      )}
    </div>
  )
}
