import { SupabaseClient } from '@supabase/supabase-js'
import { Workout, WorkoutWithExercises, Exercise } from '@/lib/types/database'

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

  if (error) throw error
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

  if (error) throw error

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
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as Workout
}

export async function getWorkoutWithExercises(
  supabase: SupabaseClient,
  workoutId: string
): Promise<WorkoutWithExercises | null> {
  const { data, error } = await supabase
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

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const workout = data as WorkoutWithExercises

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
  const { data, error } = await supabase
    .from('workouts')
    .insert(workout)
    .select()
    .single()

  if (error) throw error
  return data as Workout
}

export async function createWeekWorkouts(
  supabase: SupabaseClient,
  userId: string,
  weekNumber: number
): Promise<Workout[]> {
  const workouts = [1, 2, 3].map(day => ({
    user_id: userId,
    week_number: weekNumber,
    day_number: day,
  }))

  const { data, error } = await supabase
    .from('workouts')
    .insert(workouts)
    .select()

  if (error) throw error
  return data as Workout[]
}

export async function completeWorkout(
  supabase: SupabaseClient,
  workoutId: string
): Promise<Workout> {
  const { data, error } = await supabase
    .from('workouts')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', workoutId)
    .select()
    .single()

  if (error) throw error
  return data as Workout
}

export async function duplicateWorkoutsToNextWeek(
  supabase: SupabaseClient,
  userId: string,
  fromWeek: number,
  toWeek: number
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

  if (fetchError) throw fetchError

  type WorkoutWithExercisesPartial = Workout & { exercises: Exercise[] }
  const workoutsWithExercises = existingWorkouts as WorkoutWithExercisesPartial[]

  if (!workoutsWithExercises?.length) {
    return createWeekWorkouts(supabase, userId, toWeek)
  }

  // Create new workouts for the new week
  const newWorkouts = await createWeekWorkouts(supabase, userId, toWeek)

  // Duplicate exercises for each day
  for (const oldWorkout of workoutsWithExercises) {
    const newWorkout = newWorkouts.find(w => w.day_number === oldWorkout.day_number)

    if (newWorkout && oldWorkout.exercises?.length) {
      for (const ex of oldWorkout.exercises) {
        // Create the exercise
        const { data: newExercise, error: insertError } = await supabase
          .from('exercises')
          .insert({
            workout_id: newWorkout.id,
            name: ex.name,
            order: ex.order,
            sets: ex.sets,
            weight_kg: ex.weight_kg,
            rep_min: ex.rep_min,
            rep_max: ex.rep_max,
            target_effort_min: ex.target_effort_min,
            target_effort_max: ex.target_effort_max,
          })
          .select()
          .single()

        if (insertError) throw insertError

        // Create exercise sets for this exercise
        const sets = Array.from({ length: ex.sets }, (_, i) => ({
          exercise_id: newExercise.id,
          set_number: i + 1,
        }))

        const { error: setsError } = await supabase
          .from('exercise_sets')
          .insert(sets)

        if (setsError) throw setsError
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

  if (error) throw error
}
