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

    // Calculate a composite readiness score using RPE, RIR, effort %, and reps
    // Higher score = more ready for weight increase
    let readinessScore = 0
    let scoredSets = 0

    for (const set of completedSets) {
      const reps = set.reps_completed ?? 0
      const repTarget = exercise.rep_max

      // Rep completion ratio (0-1, can exceed 1 if exceeding target)
      const repRatio = repTarget > 0 ? Math.min(reps / repTarget, 1) : 0

      let effortScore = 0

      if (set.rpe !== null) {
        // RPE-based scoring: lower RPE = more room to grow
        // RPE 6 = very easy (score 1.0), RPE 7 = easy (0.85), RPE 8 = moderate (0.65)
        // RPE 9 = hard (0.35), RPE 10 = max (0.0)
        effortScore = Math.max(0, (10 - set.rpe) / 4)
      } else if (set.rir !== null) {
        // RIR-based scoring: higher RIR = more room to grow
        // RIR 3 = easy (0.9), RIR 2 = moderate (0.65), RIR 1 = hard (0.4), RIR 0 = max (0.15)
        effortScore = Math.min(1, (set.rir + 0.5) / 3.5)
      } else if (set.effort_percentage !== null) {
        // Effort %-based scoring: lower effort = more room
        effortScore = Math.max(0, (100 - set.effort_percentage) / 30)
      } else {
        continue // No effort data, skip this set
      }

      // Combine: rep completion matters most, effort determines readiness
      // repRatio * 0.4 + effortScore * 0.6 — weighted toward effort
      readinessScore += repRatio * 0.4 + effortScore * 0.6
      scoredSets++
    }

    if (scoredSets === 0) continue

    const avgReadiness = readinessScore / scoredSets

    // Check if most sets hit at least rep_min (relaxed from requiring ALL to hit rep_max)
    const setsHittingMin = completedSets.filter((s: ExerciseSet) =>
      s.reps_completed !== null && s.reps_completed >= exercise.rep_min
    ).length
    const minRepsRatio = setsHittingMin / completedSets.length

    let recommendation: WeightRecommendationType | null = null

    // Recommended: high readiness AND hitting reps consistently
    // avgReadiness > 0.55 means roughly: hitting max reps at RPE 7.5 or lower
    if (avgReadiness > 0.55 && minRepsRatio >= 0.8) {
      recommendation = 'recommended'
    }
    // Consider: moderate readiness OR hitting reps well
    // avgReadiness > 0.4 means roughly: hitting max reps at RPE 8-8.5
    else if (avgReadiness > 0.4 && minRepsRatio >= 0.7) {
      recommendation = 'consider'
    }

    if (recommendation) {
      recommendations.push({
        exercise_id: exercise.id,
        exercise_name: name,
        current_weight: exercise.weight_kg,
        recommendation,
        weight_direction: exercise.weight_direction || 'increase',
      })
    }
  }

  return recommendations
}

export function calculateNewWeight(currentWeight: number, direction: 'increase' | 'decrease' = 'increase'): number {
  if (direction === 'decrease') {
    // For machine-assisted exercises: less weight = harder (progression)
    if (currentWeight <= 2.5) {
      return Math.max(0, currentWeight - 1.25)
    } else if (currentWeight < 20) {
      return currentWeight - 1.25
    } else if (currentWeight < 50) {
      return currentWeight - 2.5
    } else {
      return Math.round((currentWeight * 0.95) * 2) / 2 // 5% decrease, round to nearest 0.5kg
    }
  }

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
