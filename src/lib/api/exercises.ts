import { SupabaseClient } from '@supabase/supabase-js'
import { Exercise, ExerciseWithSets, ExerciseStatus } from '@/lib/types/database'
import { mapSupabaseError } from '@/lib/errors'

export async function getExercisesByWorkout(
  supabase: SupabaseClient,
  workoutId: string
): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('workout_id', workoutId)
    .order('order')

  if (error) throw mapSupabaseError(error, 'Exercises')
  return data as Exercise[]
}

export async function getExercise(
  supabase: SupabaseClient,
  exerciseId: string
): Promise<Exercise | null> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', exerciseId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw mapSupabaseError(error, 'Exercise')
  }
  return data as Exercise
}

export async function getExerciseWithSets(
  supabase: SupabaseClient,
  exerciseId: string
): Promise<ExerciseWithSets | null> {
  const { data, error } = await supabase
    .from('exercises')
    .select(`
      *,
      exercise_sets (*)
    `)
    .eq('id', exerciseId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw mapSupabaseError(error, 'Exercise with sets')
  }

  const exercise = data as ExerciseWithSets

  // Sort sets by set_number
  if (exercise?.exercise_sets) {
    exercise.exercise_sets.sort((a, b) => a.set_number - b.set_number)
  }

  return exercise
}

export async function createExercise(
  supabase: SupabaseClient,
  exercise: {
    workout_id: string
    name: string
    sets: number
    weight_kg: number
    rep_min: number
    rep_max: number
    target_effort_min: number
    target_effort_max: number
    is_main_exercise?: boolean
    toughness_rating?: number
    exercise_library_id?: string | null
  }
): Promise<Exercise> {
  // Get the current max order for this workout
  const { data: existing, error: orderError } = await supabase
    .from('exercises')
    .select('order')
    .eq('workout_id', exercise.workout_id)
    .order('order', { ascending: false })
    .limit(1)

  if (orderError) throw mapSupabaseError(orderError, 'Exercise order')

  const existingExercises = existing as { order: number }[] | null
  const nextOrder = existingExercises?.length ? existingExercises[0].order + 1 : 0

  const { data, error } = await supabase
    .from('exercises')
    .insert({
      ...exercise,
      order: nextOrder,
      is_main_exercise: exercise.is_main_exercise ?? false,
      toughness_rating: exercise.toughness_rating ?? 1
    })
    .select()
    .single()

  if (error) throw mapSupabaseError(error, 'Exercise')

  const createdExercise = data as Exercise

  // Create empty sets for this exercise
  const sets = Array.from({ length: exercise.sets }, (_, i) => ({
    exercise_id: createdExercise.id,
    set_number: i + 1,
  }))

  const { error: setsError } = await supabase
    .from('exercise_sets')
    .insert(sets)

  if (setsError) throw mapSupabaseError(setsError, 'Exercise sets')

  return createdExercise
}

export async function updateExercise(
  supabase: SupabaseClient,
  exerciseId: string,
  updates: Partial<{
    name: string
    sets: number
    weight_kg: number
    rep_min: number
    rep_max: number
    target_effort_min: number
    target_effort_max: number
    status: ExerciseStatus
    is_main_exercise: boolean
    toughness_rating: number
  }>
): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .update(updates)
    .eq('id', exerciseId)
    .select()
    .single()

  if (error) throw mapSupabaseError(error, 'Exercise')
  return data as Exercise
}

export async function updateExerciseStatus(
  supabase: SupabaseClient,
  exerciseId: string,
  status: ExerciseStatus
): Promise<Exercise> {
  return updateExercise(supabase, exerciseId, { status })
}

export async function reorderExercises(
  supabase: SupabaseClient,
  workoutId: string,
  exerciseIds: string[]
): Promise<void> {
  // Update each exercise with its new order
  const updates = exerciseIds.map((id, index) =>
    supabase
      .from('exercises')
      .update({ order: index })
      .eq('id', id)
      .eq('workout_id', workoutId)
  )

  const results = await Promise.all(updates)
  const errors = results.filter(r => r.error)
  if (errors.length) throw mapSupabaseError(errors[0].error, 'Exercise reordering')
}

export async function deleteExercise(
  supabase: SupabaseClient,
  exerciseId: string
): Promise<void> {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', exerciseId)

  if (error) throw mapSupabaseError(error, 'Exercise')
}

export async function skipExercise(
  supabase: SupabaseClient,
  exerciseId: string
): Promise<Exercise> {
  // Mark exercise as skipped
  const { data: exercise, error: exerciseError } = await supabase
    .from('exercises')
    .update({ status: 'skipped' })
    .eq('id', exerciseId)
    .select()
    .single()

  if (exerciseError) throw mapSupabaseError(exerciseError, 'Exercise')

  // Mark all incomplete sets as skipped
  const { error: setsError } = await supabase
    .from('exercise_sets')
    .update({ skipped: true })
    .eq('exercise_id', exerciseId)
    .is('completed_at', null)

  if (setsError) throw mapSupabaseError(setsError, 'Exercise sets')

  return exercise as Exercise
}

export async function getNextIncompleteExercise(
  supabase: SupabaseClient,
  workoutId: string,
  currentExerciseId: string
): Promise<Exercise | null> {
  // Get all exercises for this workout
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('workout_id', workoutId)
    .order('order')

  if (error) throw mapSupabaseError(error, 'Exercises')

  const exercises = data as Exercise[]
  if (!exercises?.length) return null

  const incomplete = exercises.filter(e => e.status === 'incomplete')
  if (incomplete.length === 0) return null

  const currentIndex = exercises.findIndex(e => e.id === currentExerciseId)

  // Find next incomplete after current position
  for (let i = currentIndex + 1; i < exercises.length; i++) {
    if (exercises[i].status === 'incomplete') {
      return exercises[i]
    }
  }

  // Wrap to first incomplete
  return incomplete[0]
}
