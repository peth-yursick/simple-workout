import { SupabaseClient } from '@supabase/supabase-js'

interface ExerciseData {
  name: string
  sets: number
  weight_kg: number
  rep_min: number
  rep_max: number
  target_effort_min: number
  target_effort_max: number
}

const DAY_1_EXERCISES: ExerciseData[] = [
  { name: 'Stiff leg deadlift', sets: 3, weight_kg: 40, rep_min: 6, rep_max: 8, target_effort_min: 70, target_effort_max: 80 },
  { name: 'Wide grip row', sets: 3, weight_kg: 20, rep_min: 8, rep_max: 10, target_effort_min: 70, target_effort_max: 80 },
  { name: 'Dips machine', sets: 3, weight_kg: 12, rep_min: 5, rep_max: 10, target_effort_min: 70, target_effort_max: 80 },
  { name: 'Leg press', sets: 3, weight_kg: 100, rep_min: 8, rep_max: 12, target_effort_min: 70, target_effort_max: 80 },
  { name: 'Rope face pulls', sets: 3, weight_kg: 45, rep_min: 10, rep_max: 15, target_effort_min: 70, target_effort_max: 80 },
  { name: 'Shrugs', sets: 3, weight_kg: 20, rep_min: 6, rep_max: 12, target_effort_min: 70, target_effort_max: 80 },
]

const DAY_2_EXERCISES: ExerciseData[] = [
  { name: 'Back squat', sets: 3, weight_kg: 45, rep_min: 8, rep_max: 10, target_effort_min: 70, target_effort_max: 80 },
  { name: 'Rope face pulls', sets: 3, weight_kg: 50, rep_min: 10, rep_max: 15, target_effort_min: 70, target_effort_max: 80 },
  { name: 'Chin up machine', sets: 3, weight_kg: 19, rep_min: 5, rep_max: 10, target_effort_min: 70, target_effort_max: 80 },
  { name: 'Bench press', sets: 3, weight_kg: 35, rep_min: 6, rep_max: 8, target_effort_min: 70, target_effort_max: 80 },
  { name: 'Wide grip row', sets: 3, weight_kg: 20, rep_min: 10, rep_max: 12, target_effort_min: 70, target_effort_max: 80 },
  { name: 'DB lateral raise', sets: 3, weight_kg: 5, rep_min: 8, rep_max: 15, target_effort_min: 70, target_effort_max: 80 },
]

const DAY_3_EXERCISES: ExerciseData[] = [
  { name: 'Pendlay row', sets: 3, weight_kg: 42.5, rep_min: 6, rep_max: 8, target_effort_min: 70, target_effort_max: 80 },
  { name: 'Incline chest press', sets: 3, weight_kg: 35, rep_min: 6, rep_max: 10, target_effort_min: 70, target_effort_max: 80 },
  { name: 'Leg extension', sets: 3, weight_kg: 20, rep_min: 8, rep_max: 15, target_effort_min: 70, target_effort_max: 80 },
  { name: 'Lat pulldown under', sets: 3, weight_kg: 40, rep_min: 6, rep_max: 12, target_effort_min: 70, target_effort_max: 80 },
  { name: 'Rope face pulls', sets: 3, weight_kg: 40, rep_min: 10, rep_max: 15, target_effort_min: 70, target_effort_max: 80 },
  { name: 'Ruke', sets: 3, weight_kg: 20, rep_min: 6, rep_max: 12, target_effort_min: 70, target_effort_max: 80 },
]

const DAYS_EXERCISES = [DAY_1_EXERCISES, DAY_2_EXERCISES, DAY_3_EXERCISES]

export async function seedUserWorkouts(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  // Create 3 workouts for Week 1
  const workoutsToCreate = [1, 2, 3].map(dayNumber => ({
    user_id: userId,
    week_number: 1,
    day_number: dayNumber,
  }))

  const { data: workouts, error: workoutsError } = await supabase
    .from('workouts')
    .insert(workoutsToCreate)
    .select()

  if (workoutsError) throw workoutsError

  // Create exercises for each workout
  for (const workout of workouts) {
    const dayExercises = DAYS_EXERCISES[workout.day_number - 1]

    const exercisesToCreate = dayExercises.map((exercise, index) => ({
      workout_id: workout.id,
      name: exercise.name,
      order: index,
      sets: exercise.sets,
      weight_kg: exercise.weight_kg,
      rep_min: exercise.rep_min,
      rep_max: exercise.rep_max,
      target_effort_min: exercise.target_effort_min,
      target_effort_max: exercise.target_effort_max,
      status: 'incomplete',
    }))

    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .insert(exercisesToCreate)
      .select()

    if (exercisesError) throw exercisesError

    // Create sets for each exercise
    for (const exercise of exercises) {
      const setsToCreate = Array.from({ length: exercise.sets }, (_, i) => ({
        exercise_id: exercise.id,
        set_number: i + 1,
      }))

      const { error: setsError } = await supabase
        .from('exercise_sets')
        .insert(setsToCreate)

      if (setsError) throw setsError
    }
  }
}
