import { SupabaseClient } from '@supabase/supabase-js'
import { ExerciseSet } from '@/lib/types/database'
import { mapSupabaseError } from '@/lib/errors'

export async function getSetsByExercise(
  supabase: SupabaseClient,
  exerciseId: string
): Promise<ExerciseSet[]> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('exercise_id', exerciseId)
    .order('set_number')

  if (error) throw mapSupabaseError(error, 'Exercise sets')
  return data as ExerciseSet[]
}

export async function getSet(
  supabase: SupabaseClient,
  setId: string
): Promise<ExerciseSet | null> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('id', setId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw mapSupabaseError(error, 'Exercise set')
  }
  return data as ExerciseSet
}

export async function completeSet(
  supabase: SupabaseClient,
  setId: string,
  repsCompleted: number,
  rpe?: number,
  rir?: number,
  effortPercentage?: number
): Promise<ExerciseSet> {
  const updateData: {
    reps_completed: number
    rpe?: number
    rir?: number
    effort_percentage?: number
    completed_at: string
  } = {
    reps_completed: repsCompleted,
    completed_at: new Date().toISOString(),
  }

  // Only set the effort metric that was provided
  if (rpe !== undefined) {
    updateData.rpe = rpe
  }
  if (rir !== undefined) {
    updateData.rir = rir
  }
  if (effortPercentage !== undefined) {
    updateData.effort_percentage = effortPercentage
  }

  const { data, error } = await supabase
    .from('exercise_sets')
    .update(updateData)
    .eq('id', setId)
    .select()
    .single()

  if (error) throw mapSupabaseError(error, 'Exercise set')
  return data as ExerciseSet
}

export async function updateSet(
  supabase: SupabaseClient,
  setId: string,
  updates: Partial<{
    reps_completed: number
    effort_percentage: number
    rpe: number
    rir: number
    skipped: boolean
  }>
): Promise<ExerciseSet> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .update(updates)
    .eq('id', setId)
    .select()
    .single()

  if (error) throw mapSupabaseError(error, 'Exercise set')
  return data as ExerciseSet
}

export async function skipSet(
  supabase: SupabaseClient,
  setId: string
): Promise<ExerciseSet> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .update({ skipped: true })
    .eq('id', setId)
    .select()
    .single()

  if (error) throw mapSupabaseError(error, 'Exercise set')
  return data as ExerciseSet
}

export async function resetSet(
  supabase: SupabaseClient,
  setId: string
): Promise<ExerciseSet> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .update({
      reps_completed: null,
      effort_percentage: null,
      rpe: null,
      rir: null,
      skipped: false,
      completed_at: null,
    })
    .eq('id', setId)
    .select()
    .single()

  if (error) throw mapSupabaseError(error, 'Exercise set')
  return data as ExerciseSet
}

export async function checkExerciseCompletion(
  supabase: SupabaseClient,
  exerciseId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select('completed_at, skipped')
    .eq('exercise_id', exerciseId)

  if (error) throw mapSupabaseError(error, 'Exercise sets')

  const sets = data as { completed_at: string | null; skipped: boolean }[]

  // Exercise is complete if all sets are either completed or skipped
  return sets.every(set => set.completed_at !== null || set.skipped)
}

export async function getExerciseProgress(
  supabase: SupabaseClient,
  exerciseId: string
): Promise<{ completed: number; total: number; skipped: number }> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select('completed_at, skipped')
    .eq('exercise_id', exerciseId)

  if (error) throw mapSupabaseError(error, 'Exercise sets')

  const sets = data as { completed_at: string | null; skipped: boolean }[]

  return {
    completed: sets.filter(s => s.completed_at !== null).length,
    skipped: sets.filter(s => s.skipped).length,
    total: sets.length,
  }
}
