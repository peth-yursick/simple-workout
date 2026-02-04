import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getExerciseWithSets, getExercisesByWorkout } from '@/lib/api/exercises'
import { getWorkout } from '@/lib/api/workouts'
import { ExerciseTracker } from './ExerciseTracker'

interface ExercisePageProps {
  params: Promise<{ id: string; exerciseId: string }>
}

export default async function ExercisePage({ params }: ExercisePageProps) {
  const { id: workoutId, exerciseId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const [workout, exercise, allExercises] = await Promise.all([
    getWorkout(supabase, workoutId),
    getExerciseWithSets(supabase, exerciseId),
    getExercisesByWorkout(supabase, workoutId),
  ])

  if (!workout || !exercise) {
    notFound()
  }

  // Find any incomplete exercise (could be before or after current one)
  const incompleteExercises = allExercises.filter(e => e.id !== exerciseId && e.status === 'incomplete')
  const nextIncompleteExercise = incompleteExercises.length > 0 ? incompleteExercises[0] : null

  return (
    <ExerciseTracker
      workout={workout}
      exercise={exercise}
      nextExerciseId={nextIncompleteExercise?.id}
      incompleteCount={incompleteExercises.length}
    />
  )
}
