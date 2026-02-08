import { SupabaseClient } from '@supabase/supabase-js'
import { Workout, WorkoutWithExercises, Exercise, Program } from '@/lib/types/database'
import { mapSupabaseError } from '@/lib/errors'

export async function getWorkoutsByWeek(
  supabase: SupabaseClient,
  userId: string,
  weekNumber: number
): Promise<Workout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .eq('week_number', weekNumber)
    .order('day_number')

  if (error) throw mapSupabaseError(error, 'Workouts')
  return data as Workout[]
}

// Get workouts with exercise progress in a single query (optimized)
export async function getWorkoutsWithProgress(
  supabase: SupabaseClient,
  userId: string,
  weekNumber: number
): Promise<{
  workout: Workout
  exerciseCount: number
  completedCount: number
  hasSkipped: boolean
}[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      exercises (
        id,
        status
      )
    `)
    .eq('user_id', userId)
    .eq('week_number', weekNumber)
    .order('day_number')

  if (error) throw mapSupabaseError(error, 'Workouts with progress')

  return (data || []).map((workout: Workout & { exercises: { id: string; status: string }[] }) => {
    const exercises = workout.exercises || []
    const completedCount = exercises.filter(e => e.status === 'complete' || e.status === 'skipped').length
    const hasSkipped = exercises.some(e => e.status === 'skipped')

    // Remove exercises from workout object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { exercises: _exercises, ...workoutData } = workout

    return {
      workout: workoutData as Workout,
      exerciseCount: exercises.length,
      completedCount,
      hasSkipped,
    }
  })
}

export async function getWorkout(
  supabase: SupabaseClient,
  workoutId: string
): Promise<Workout | null> {
  const result = await supabase
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .single()

  if (result.error) throw mapSupabaseError(result.error, 'Workout')
  return result.data as Workout | null
}

export async function getWorkoutWithExercises(
  supabase: SupabaseClient,
  workoutId: string
): Promise<WorkoutWithExercises | null> {
  const result = await supabase
    .from('workouts')
    .select(`
      *,
      exercises (
        *,
        exercise_sets (*)
      )
    `)
    .eq('id', workoutId)
    .single()

  if (result.error) throw mapSupabaseError(result.error, 'Workout with exercises')
  if (!result.data) return null

  const workout = result.data as WorkoutWithExercises

  // Sort exercises by order and sets by set_number
  if (workout?.exercises) {
    workout.exercises.sort((a, b) => a.order - b.order)
    workout.exercises.forEach(exercise => {
      if (exercise.exercise_sets) {
        exercise.exercise_sets.sort((a, b) => a.set_number - b.set_number)
      }
    })
  }

  return workout
}

export async function createWorkout(
  supabase: SupabaseClient,
  workout: {
    user_id: string
    week_number: number
    day_number: number
  }
): Promise<Workout> {
  const result = await supabase
    .from('workouts')
    .insert(workout)
    .select()
    .single()

  if (result.error) throw mapSupabaseError(result.error, 'Workout')
  return result.data as Workout
}

export async function createWeekWorkouts(
  supabase: SupabaseClient,
  userId: string,
  weekNumber: number,
  daysPerWeek: number = 3,
  programId?: string
): Promise<Workout[]> {
  const workouts = Array.from({ length: daysPerWeek }, (_, i) => {
    const day = i + 1
    const workout: Record<string, unknown> = {
      user_id: userId,
      week_number: weekNumber,
      day_number: day,
    }
    if (programId) workout.program_id = programId
    return workout
  })

  const result = await supabase
    .from('workouts')
    .insert(workouts)
    .select()

  if (result.error) throw mapSupabaseError(result.error, 'Week workouts')
  return result.data as Workout[]
}

export async function completeWorkout(
  supabase: SupabaseClient,
  workoutId: string
): Promise<Workout> {
  const result = await supabase
    .from('workouts')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', workoutId)
    .select()
    .single()

  if (result.error) throw mapSupabaseError(result.error, 'Workout')
  return result.data as Workout
}

export async function duplicateWorkoutsToNextWeek(
  supabase: SupabaseClient,
  userId: string,
  fromWeek: number,
  toWeek: number,
  programId?: string,
  daysPerWeek: number = 3
): Promise<Workout[]> {
  // Get existing workouts with exercises
  const { data: existingWorkouts, error: fetchError } = await supabase
    .from('workouts')
    .select(`
      *,
      exercises (*)
    `)
    .eq('user_id', userId)
    .eq('week_number', fromWeek)
    .order('day_number')

  if (fetchError) throw mapSupabaseError(fetchError, 'Existing workouts')

  type WorkoutWithExercisesPartial = Workout & { exercises: Exercise[] }
  const workoutsWithExercises = existingWorkouts as WorkoutWithExercisesPartial[]

  if (!workoutsWithExercises?.length) {
    return createWeekWorkouts(supabase, userId, toWeek, daysPerWeek, programId)
  }

  // Create new workouts for the new week
  const newWorkouts = await createWeekWorkouts(supabase, userId, toWeek, daysPerWeek, programId)

  // Duplicate exercises for each day
  for (const oldWorkout of workoutsWithExercises) {
    const newWorkout = newWorkouts.find(w => w.day_number === oldWorkout.day_number)

    if (newWorkout && oldWorkout.exercises?.length) {
      for (const ex of oldWorkout.exercises) {
        // Build exercise data object - only include Phase 1 fields if they exist
        const exerciseData: Record<string, unknown> = {
          workout_id: newWorkout.id,
          name: ex.name,
          order: ex.order,
          sets: ex.sets,
          weight_kg: ex.weight_kg,
          rep_min: ex.rep_min,
          rep_max: ex.rep_max,
          target_effort_min: ex.target_effort_min,
          target_effort_max: ex.target_effort_max,
        }

        // Only add Phase 1 fields if they exist on the source exercise and have valid values
        const exAny = ex as unknown as Record<string, unknown>

        if (exAny.uses_rpe !== undefined) exerciseData.uses_rpe = exAny.uses_rpe === true
        if (exAny.uses_rir !== undefined) exerciseData.uses_rir = exAny.uses_rir === true
        if (exAny.target_rpe_min !== undefined && exAny.target_rpe_min !== null) exerciseData.target_rpe_min = exAny.target_rpe_min
        if (exAny.target_rpe_max !== undefined && exAny.target_rpe_max !== null) exerciseData.target_rpe_max = exAny.target_rpe_max
        if (exAny.target_rir_min !== undefined && exAny.target_rir_min !== null) exerciseData.target_rir_min = exAny.target_rir_min
        if (exAny.target_rir_max !== undefined && exAny.target_rir_max !== null) exerciseData.target_rir_max = exAny.target_rir_max
        if (exAny.is_main_exercise !== undefined) exerciseData.is_main_exercise = exAny.is_main_exercise === true
        if (exAny.toughness_rating !== undefined && exAny.toughness_rating !== null) exerciseData.toughness_rating = exAny.toughness_rating
        if (exAny.weight_direction !== undefined) exerciseData.weight_direction = exAny.weight_direction
        if (exAny.exercise_library_id !== undefined && exAny.exercise_library_id !== null) exerciseData.exercise_library_id = exAny.exercise_library_id

        // Create the exercise
        const { data: newExercise, error: insertError } = await supabase
          .from('exercises')
          .insert(exerciseData)
          .select()
          .single()

        if (insertError) {
          console.error('Failed to insert exercise:', exerciseData, insertError)
          throw mapSupabaseError(insertError, 'Exercise')
        }

        // Create exercise sets for this exercise
        const sets = Array.from({ length: ex.sets }, (_, i) => ({
          exercise_id: newExercise.id,
          set_number: i + 1,
        }))

        const { error: setsError } = await supabase
          .from('exercise_sets')
          .insert(sets)

        if (setsError) throw mapSupabaseError(setsError, 'Exercise sets')
      }
    }
  }

  return newWorkouts
}

export async function deleteWorkout(
  supabase: SupabaseClient,
  workoutId: string
): Promise<void> {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)

  if (error) throw mapSupabaseError(error, 'Workout')
}
