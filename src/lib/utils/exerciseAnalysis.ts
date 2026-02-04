import { SupabaseClient } from '@supabase/supabase-js'
import {
  Exercise,
  ExerciseSet,
  WeightRecommendation,
  WeightRecommendationExercise,
  WeightRecommendationType
} from '@/lib/types/database'

interface ExerciseWithSetsData extends Exercise {
  exercise_sets: ExerciseSet[]
}

interface WorkoutWithExercisesData {
  id: string
  exercises: ExerciseWithSetsData[]
}

export async function analyzeWeekForRecommendations(
  supabase: SupabaseClient,
  userId: string,
  weekNumber: number
): Promise<WeightRecommendationExercise[]> {
  // Fetch all workouts with exercises and sets for this week
  const { data: workouts, error } = await supabase
    .from('workouts')
    .select(`
      id,
      exercises (
        *,
        exercise_sets (*)
      )
    `)
    .eq('user_id', userId)
    .eq('week_number', weekNumber)

  if (error) throw error

  const workoutsData = workouts as WorkoutWithExercisesData[]

  if (!workoutsData?.length) return []

  // Flatten all exercises from all workouts
  const allExercises = workoutsData.flatMap(w => w.exercises || [])

  // Group exercises by name (same exercise across different days)
  const exerciseGroups: Record<string, ExerciseWithSetsData[]> = {}

  for (const exercise of allExercises) {
    const existing = exerciseGroups[exercise.name] || []
    existing.push(exercise)
    exerciseGroups[exercise.name] = existing
  }

  const recommendations: WeightRecommendationExercise[] = []

  for (const name of Object.keys(exerciseGroups)) {
    const exercises = exerciseGroups[name]
    // Get all sets across all instances of this exercise
    const allSets: ExerciseSet[] = exercises.flatMap((e: ExerciseWithSetsData) => e.exercise_sets || [])
    const completedSets = allSets.filter((s: ExerciseSet) => s.completed_at !== null && !s.skipped)

    if (completedSets.length === 0) continue

    // Get exercise parameters from the first instance
    const exercise = exercises[0]

    // Check if ALL completed sets hit rep_max (maximum required reps)
    const allHitMaxReps = completedSets.every((set: ExerciseSet) =>
      set.reps_completed !== null &&
      set.reps_completed >= exercise.rep_max
    )

    // If not all sets hit max reps, no recommendation
    if (!allHitMaxReps) continue

    // Calculate average effort across all completed sets
    const setsWithEffort = completedSets.filter((s: ExerciseSet) => s.effort_percentage !== null)
    if (setsWithEffort.length === 0) continue

    const averageEffort = setsWithEffort.reduce((sum: number, s: ExerciseSet) =>
      sum + (s.effort_percentage || 0), 0) / setsWithEffort.length

    let recommendation: WeightRecommendationType | null = null

    // Recommended: All sets hit max reps AND average effort < 80%
    if (averageEffort < 80) {
      recommendation = 'recommended'
    }
    // Consider: All sets hit max reps AND average effort 80-90%
    else if (averageEffort >= 80 && averageEffort < 90) {
      recommendation = 'consider'
    }
    // No recommendation: Average effort >= 90%

    if (recommendation) {
      recommendations.push({
        exercise_id: exercise.id,
        exercise_name: name,
        current_weight: exercise.weight_kg,
        recommendation,
      })
    }
  }

  return recommendations
}

export function calculateNewWeight(currentWeight: number): number {
  // Standard progressive overload: increase by 2.5kg (or 5% for heavier weights)
  if (currentWeight < 20) {
    return currentWeight + 1.25
  } else if (currentWeight < 50) {
    return currentWeight + 2.5
  } else {
    return Math.round((currentWeight * 1.05) * 2) / 2 // Round to nearest 0.5kg
  }
}

export async function createWeightRecommendation(
  supabase: SupabaseClient,
  userId: string,
  weekNumber: number,
  exercises: WeightRecommendationExercise[]
): Promise<WeightRecommendation> {
  const { data, error } = await supabase
    .from('weight_recommendations')
    .insert({
      user_id: userId,
      week_number: weekNumber,
      exercises,
    })
    .select()
    .single()

  if (error) throw error
  return data as WeightRecommendation
}

export async function getWeightRecommendation(
  supabase: SupabaseClient,
  userId: string,
  weekNumber: number
): Promise<WeightRecommendation | null> {
  const { data, error } = await supabase
    .from('weight_recommendations')
    .select('*')
    .eq('user_id', userId)
    .eq('week_number', weekNumber)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as WeightRecommendation
}
