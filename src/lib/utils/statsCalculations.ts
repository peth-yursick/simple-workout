import { SupabaseClient } from '@supabase/supabase-js'
import { getMuscleGroups, MuscleGroup, ALL_MUSCLE_GROUPS } from './muscleMapping'

export type TimeFilter = 'all-time' | 'last-2-months'

export interface DashboardStats {
  totalWorkouts: number
  currentLevel: number
  levelProgress: number
  avgWorkoutsPerWeek: number
  consistencyPercentage: number
  weeklyStreak: number
  volumeOverTime: VolumeDataPoint[]
  advancingExercises: ExerciseProgress[]
  stagnatingExercises: ExerciseProgress[]
  muscleGroupVolumes: MuscleGroupVolume[]
  exerciseVolumes: ExerciseVolume[]
  individualMuscleVolumes: IndividualMuscleVolume[]
}

export interface ExerciseVolume {
  name: string
  totalVolume: number
  weeklyProgression: ExerciseWeekVolume[]
}

export interface ExerciseWeekVolume {
  weekNumber: number
  volume: number
}

export interface VolumeDataPoint {
  weekNumber: number
  volume: number
  date: string
}

export interface ExerciseProgress {
  name: string
  currentWeight: number
  weightHistory: number[]
  weeksSinceIncrease: number
  totalIncreases: number
}

export interface MuscleGroupVolume {
  muscle: MuscleGroup
  volume: number
  percentage: number // relative to max
}

export interface IndividualMuscleVolume {
  muscle: string
  volume: number
  percentage: number
  isPrimary: boolean // Whether this muscle is primarily targeted in the exercise
}

/**
 * Get the date cutoff for the time filter
 */
function getDateCutoff(filter: TimeFilter): Date | null {
  if (filter === 'all-time') return null
  const date = new Date()
  date.setMonth(date.getMonth() - 2)
  return date
}

/**
 * Calculate all dashboard statistics
 */
export async function calculateDashboardStats(
  supabase: SupabaseClient,
  userId: string,
  filter: TimeFilter
): Promise<DashboardStats> {
  const cutoffDate = getDateCutoff(filter)

  // Fetch all data in parallel
  const [
    workoutsData,
    profileData,
    exercisesWithSets,
  ] = await Promise.all([
    fetchWorkouts(supabase, userId, cutoffDate),
    fetchProfile(supabase, userId),
    fetchExercisesWithSets(supabase, userId, cutoffDate),
  ])

  // Count completed (non-skipped) workouts
  const totalWorkouts = workoutsData.filter(w => {
    const skippedAt = 'skipped_at' in w ? w.skipped_at : null
    return w.completed_at !== null && skippedAt === null
  }).length

  // Level info
  const currentLevel = Number(profileData?.current_level) || 1
  const levelProgress = Number(profileData?.level_progress) || 0

  // Calculate avg workouts per week (pass all workouts to get week count)
  const avgWorkoutsPerWeek = calculateAvgWorkoutsPerWeek(workoutsData)

  // Calculate consistency (pass all workouts)
  const consistencyPercentage = calculateConsistency(workoutsData)

  // Calculate weekly streak
  const weeklyStreak = calculateWeeklyStreak(workoutsData)

  // Calculate volume over time
  const volumeOverTime = calculateVolumeOverTime(exercisesWithSets as unknown as WorkoutWithExercises[])

  // Calculate exercise progress
  const { advancing, stagnating } = calculateExerciseProgress(exercisesWithSets as unknown as WorkoutWithExercises[])

  // Calculate muscle group volumes
  const muscleGroupVolumes = calculateMuscleGroupVolumes(exercisesWithSets as unknown as WorkoutWithExercises[])

  // Calculate per-exercise volumes
  const exerciseVolumes = calculateExerciseVolumes(exercisesWithSets as unknown as WorkoutWithExercises[])

  // Calculate individual muscle volumes
  const individualMuscleVolumes = calculateIndividualMuscleVolumes(exercisesWithSets as unknown as WorkoutWithExercises[])

  return {
    totalWorkouts,
    currentLevel,
    levelProgress,
    avgWorkoutsPerWeek,
    consistencyPercentage,
    weeklyStreak,
    volumeOverTime,
    advancingExercises: advancing,
    stagnatingExercises: stagnating,
    muscleGroupVolumes,
    exerciseVolumes,
    individualMuscleVolumes,
  }
}

async function fetchWorkouts(supabase: SupabaseClient, userId: string, cutoffDate: Date | null) {
  let query = supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('week_number', { ascending: true })

  if (cutoffDate) {
    query = query.gte('created_at', cutoffDate.toISOString())
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

async function fetchProfile(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return data as Record<string, unknown> | null
}

async function fetchExercisesWithSets(supabase: SupabaseClient, userId: string, cutoffDate: Date | null) {
  // Fetch workouts with exercises (without exercise_library join due to potential FK issues)
  let query = supabase
    .from('workouts')
    .select(`
      id,
      week_number,
      day_number,
      created_at,
      exercises (
        id,
        name,
        weight_kg,
        sets,
        rep_min,
        rep_max,
        exercise_library_id,
        exercise_sets (
          id,
          reps_completed,
          effort_percentage,
          completed_at,
          skipped
        )
      )
    `)
    .eq('user_id', userId)
    .order('week_number', { ascending: true })

  if (cutoffDate) {
    query = query.gte('created_at', cutoffDate.toISOString())
  }

  const { data, error } = await query
  if (error) throw error

  // Collect unique exercise_library_ids
  const libraryIds = new Set<string>()
  for (const workout of data || []) {
    for (const exercise of workout.exercises || []) {
      if (exercise.exercise_library_id) {
        libraryIds.add(exercise.exercise_library_id)
      }
    }
  }

  // Fetch exercise_library data separately
  let exerciseLibraryMap: Record<string, { id: string; primary_muscles: unknown; secondary_muscles: unknown }> = {}
  if (libraryIds.size > 0) {
    const { data: libraryData, error: libraryError } = await supabase
      .from('exercise_library')
      .select('id, primary_muscles, secondary_muscles')
      .in('id', Array.from(libraryIds))

    if (!libraryError && libraryData) {
      exerciseLibraryMap = Object.fromEntries(
        libraryData.map((item) => [item.id, item])
      )
    }
  }

  // Merge exercise_library data into exercises using type assertion
  const workoutsWithLibrary = (data || []).map((workout) => ({
    ...workout,
    exercises: (workout.exercises || []).map((exercise) => ({
      ...exercise,
      exercise_library: exercise.exercise_library_id
        ? exerciseLibraryMap[exercise.exercise_library_id] || null
        : null
    }))
  }))

  return workoutsWithLibrary as unknown
}

function calculateAvgWorkoutsPerWeek(
  workouts: { week_number: number; completed_at: string | null }[]
): number {
  if (workouts.length === 0) return 0

  // Get the number of weeks based on the actual week numbers in the data
  const weekNumbers = Array.from(new Set(workouts.map(w => w.week_number)))
  const totalWeeks = weekNumbers.length

  if (totalWeeks === 0) return 0

  // Count completed workouts (not skipped)
  const completedCount = workouts.filter(w => w.completed_at !== null).length

  return Math.round((completedCount / totalWeeks) * 10) / 10
}

function calculateConsistency(
  workouts: { week_number: number; completed_at: string | null; skipped_at?: string | null }[]
): number {
  if (workouts.length === 0) return 0

  // Get the number of weeks based on actual week numbers
  const weekNumbers = Array.from(new Set(workouts.map(w => w.week_number)))
  const totalWeeks = weekNumbers.length

  if (totalWeeks === 0) return 0

  // Expected: 3 workouts per week
  const expectedWorkouts = totalWeeks * 3

  // Count completed workouts (completed_at is not null, and not skipped)
  const completedCount = workouts.filter(w => {
    const skippedAt = 'skipped_at' in w ? w.skipped_at : null
    return w.completed_at !== null && skippedAt === null
  }).length

  return Math.min(100, Math.round((completedCount / expectedWorkouts) * 100))
}

function calculateWeeklyStreak(workouts: { week_number: number; completed_at: string | null; skipped_at?: string | null }[]): number {
  // Group workouts by week
  const weeklyCompletion: Record<number, number> = {}

  for (const w of workouts) {
    const skippedAt = 'skipped_at' in w ? w.skipped_at : null
    if (w.completed_at || skippedAt) {
      weeklyCompletion[w.week_number] = (weeklyCompletion[w.week_number] || 0) + 1
    }
  }

  // Find current streak of weeks with 3/3 days
  const weekNumbers = Object.keys(weeklyCompletion).map(Number).sort((a, b) => b - a)
  let streak = 0

  for (const week of weekNumbers) {
    if (weeklyCompletion[week] >= 3) {
      streak++
    } else {
      break
    }
  }

  return streak
}

interface WorkoutWithExercises {
  week_number: number
  exercises: {
    name: string
    weight_kg: number
    exercise_library: {
      primary_muscles: { muscle: string; activation: number }[] | null
      secondary_muscles: { muscle: string; activation: number }[] | null
    } | null
    exercise_sets: {
      reps_completed: number | null
      completed_at: string | null
      skipped: boolean
    }[]
  }[]
}

function calculateVolumeOverTime(workoutsData: WorkoutWithExercises[]): VolumeDataPoint[] {
  // Group by week
  const weeklyVolumes: Record<number, number> = {}

  for (const workout of workoutsData) {
    const weekNum = workout.week_number
    let workoutVolume = 0

    for (const exercise of workout.exercises || []) {
      for (const set of exercise.exercise_sets || []) {
        if (set.completed_at && !set.skipped && set.reps_completed) {
          workoutVolume += set.reps_completed * exercise.weight_kg
        }
      }
    }

    weeklyVolumes[weekNum] = (weeklyVolumes[weekNum] || 0) + workoutVolume
  }

  return Object.entries(weeklyVolumes)
    .map(([week, volume]) => ({
      weekNumber: parseInt(week),
      volume: Math.round(volume),
      date: `Week ${week}`,
    }))
    .sort((a, b) => a.weekNumber - b.weekNumber)
}

function calculateExerciseProgress(workoutsData: WorkoutWithExercises[]): { advancing: ExerciseProgress[]; stagnating: ExerciseProgress[] } {
  // Track weight history per exercise name
  const exerciseWeeklyWeights: Record<string, { week: number; weight: number }[]> = {}

  for (const workout of workoutsData) {
    for (const exercise of workout.exercises || []) {
      const name = exercise.name
      if (!exerciseWeeklyWeights[name]) {
        exerciseWeeklyWeights[name] = []
      }
      // Only add if we don't already have this week
      const existing = exerciseWeeklyWeights[name].find(e => e.week === workout.week_number)
      if (!existing) {
        exerciseWeeklyWeights[name].push({ week: workout.week_number, weight: exercise.weight_kg })
      }
    }
  }

  const advancing: ExerciseProgress[] = []
  const stagnating: ExerciseProgress[] = []

  for (const [name, history] of Object.entries(exerciseWeeklyWeights)) {
    if (history.length < 1) continue

    const sortedHistory = history.sort((a, b) => a.week - b.week)
    const weights = sortedHistory.map(h => h.weight)
    const currentWeight = weights[weights.length - 1]

    // Count weight increases
    let increases = 0
    let lastIncreaseWeek = sortedHistory[0].week

    for (let i = 1; i < sortedHistory.length; i++) {
      if (sortedHistory[i].weight > sortedHistory[i - 1].weight) {
        increases++
        lastIncreaseWeek = sortedHistory[i].week
      }
    }

    const currentWeek = sortedHistory[sortedHistory.length - 1].week
    const weeksSinceIncrease = currentWeek - lastIncreaseWeek

    const progress: ExerciseProgress = {
      name,
      currentWeight,
      weightHistory: weights.slice(-5), // Last 5 weights
      weeksSinceIncrease,
      totalIncreases: increases,
    }

    // Advancing: has had weight increases (show all that have increased)
    if (increases > 0) {
      advancing.push(progress)
    }

    // Stagnating: no weight increase in 3+ weeks, or started 3+ weeks ago with no increases
    // Only show if there's enough history to judge (2+ weeks of data)
    if (history.length >= 2) {
      if (weeksSinceIncrease >= 3 || (increases === 0 && history.length >= 3)) {
        stagnating.push(progress)
      }
    }
  }

  // Sort advancing by total increases (desc), stagnating by weeks since increase (desc)
  advancing.sort((a, b) => b.totalIncreases - a.totalIncreases)
  stagnating.sort((a, b) => b.weeksSinceIncrease - a.weeksSinceIncrease)

  return {
    advancing: advancing.slice(0, 8), // Show more exercises
    stagnating: stagnating.slice(0, 8),
  }
}

function calculateMuscleGroupVolumes(workoutsData: WorkoutWithExercises[]): MuscleGroupVolume[] {
  const muscleVolumes: Record<MuscleGroup, number> = {
    Chest: 0,
    Back: 0,
    Legs: 0,
    Shoulders: 0,
    Arms: 0,
    Core: 0,
  }

  for (const workout of workoutsData) {
    for (const exercise of workout.exercises || []) {
      const { primary, secondary } = getMuscleGroups(exercise.name)

      let exerciseVolume = 0
      for (const set of exercise.exercise_sets || []) {
        if (set.completed_at && !set.skipped && set.reps_completed) {
          exerciseVolume += set.reps_completed * exercise.weight_kg
        }
      }

      // Primary muscle gets full volume, secondary gets 50%
      muscleVolumes[primary] += exerciseVolume
      if (secondary) {
        muscleVolumes[secondary] += exerciseVolume * 0.5
      }
    }
  }

  const maxVolume = Math.max(...Object.values(muscleVolumes), 1)

  return ALL_MUSCLE_GROUPS.map(muscle => ({
    muscle,
    volume: Math.round(muscleVolumes[muscle]),
    percentage: Math.round((muscleVolumes[muscle] / maxVolume) * 100),
  }))
}

function calculateExerciseVolumes(workoutsData: WorkoutWithExercises[]): ExerciseVolume[] {
  // Track volume per exercise per week
  const exerciseWeeklyVolumes: Record<string, Record<number, number>> = {}

  for (const workout of workoutsData) {
    const weekNum = workout.week_number

    for (const exercise of workout.exercises || []) {
      const name = exercise.name
      if (!exerciseWeeklyVolumes[name]) {
        exerciseWeeklyVolumes[name] = {}
      }
      if (!exerciseWeeklyVolumes[name][weekNum]) {
        exerciseWeeklyVolumes[name][weekNum] = 0
      }

      // Calculate volume for this exercise instance
      let exerciseVolume = 0
      for (const set of exercise.exercise_sets || []) {
        if (set.completed_at && !set.skipped && set.reps_completed) {
          exerciseVolume += set.reps_completed * exercise.weight_kg
        }
      }

      exerciseWeeklyVolumes[name][weekNum] += exerciseVolume
    }
  }

  // Convert to ExerciseVolume array
  return Object.entries(exerciseWeeklyVolumes)
    .map(([name, weeklyData]) => ({
      name,
      totalVolume: Object.values(weeklyData).reduce((sum, vol) => sum + vol, 0),
      weeklyProgression: Object.entries(weeklyData)
        .map(([week, volume]) => ({
          weekNumber: parseInt(week),
          volume: Math.round(volume),
        }))
        .sort((a, b) => a.weekNumber - b.weekNumber),
    }))
    .sort((a, b) => b.totalVolume - a.totalVolume)
}

function calculateIndividualMuscleVolumes(workoutsData: WorkoutWithExercises[]): IndividualMuscleVolume[] {
  const muscleVolumes: Record<string, number> = {}
  const musclePrimaryCount: Record<string, number> = {}

  for (const workout of workoutsData) {
    for (const exercise of workout.exercises || []) {
      // Calculate volume for this exercise
      let exerciseVolume = 0
      for (const set of exercise.exercise_sets || []) {
        if (set.completed_at && !set.skipped && set.reps_completed) {
          exerciseVolume += set.reps_completed * exercise.weight_kg
        }
      }

      // If exercise has library data with muscle info, use it
      if (exercise.exercise_library?.primary_muscles && exercise.exercise_library.primary_muscles.length > 0) {
        // Distribute volume across muscles based on activation percentage
        const totalActivation = exercise.exercise_library.primary_muscles.reduce(
          (sum, m) => sum + m.activation,
          0
        )

        for (const muscleData of exercise.exercise_library.primary_muscles) {
          const muscleName = muscleData.muscle
          const activationRatio = muscleData.activation / totalActivation
          const muscleVolume = exerciseVolume * activationRatio

          if (!muscleVolumes[muscleName]) {
            muscleVolumes[muscleName] = 0
            musclePrimaryCount[muscleName] = 0
          }
          muscleVolumes[muscleName] += muscleVolume
          musclePrimaryCount[muscleName] += 1
        }

        // Secondary muscles get 50% volume
        if (exercise.exercise_library.secondary_muscles && exercise.exercise_library.secondary_muscles.length > 0) {
          const secondaryTotalActivation = exercise.exercise_library.secondary_muscles.reduce(
            (sum, m) => sum + m.activation,
            0
          )
          const secondaryVolume = exerciseVolume * 0.5

          for (const muscleData of exercise.exercise_library.secondary_muscles) {
            const muscleName = muscleData.muscle
            const activationRatio = muscleData.activation / secondaryTotalActivation
            const muscleVolume = secondaryVolume * activationRatio

            if (!muscleVolumes[muscleName]) {
              muscleVolumes[muscleName] = 0
            }
            muscleVolumes[muscleName] += muscleVolume
          }
        }
      } else {
        // Fallback to muscle groups if no library data
        const { primary, secondary } = getMuscleGroups(exercise.name)
        muscleVolumes[primary] = (muscleVolumes[primary] || 0) + exerciseVolume
        if (secondary) {
          muscleVolumes[secondary] = (muscleVolumes[secondary] || 0) + exerciseVolume * 0.5
        }
      }
    }
  }

  // Convert to array and sort
  const maxVolume = Math.max(...Object.values(muscleVolumes), 1)

  return Object.entries(muscleVolumes)
    .map(([muscle, volume]) => ({
      muscle,
      volume: Math.round(volume),
      percentage: Math.round((volume / maxVolume) * 100),
      isPrimary: (musclePrimaryCount[muscle] || 0) > 0,
    }))
    .sort((a, b) => b.volume - a.volume)
}
