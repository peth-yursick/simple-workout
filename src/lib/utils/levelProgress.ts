import { SupabaseClient } from '@supabase/supabase-js'

export interface LevelInfo {
  level: number
  currentProgress: number  // 0-100 progress within current level
  totalExercisesInWeek: number
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'Beginner',
  2: 'Newcomer',
  3: 'Regular',
  4: 'Dedicated',
  5: 'Committed',
  6: 'Strong',
  7: 'Powerful',
  8: 'Elite',
  9: 'Champion',
  10: 'Master',
  15: 'Legend',
  20: 'Titan',
  25: 'Immortal',
  30: 'Godlike',
}

export function getLevelTitle(level: number): string {
  const titles = Object.entries(LEVEL_TITLES)
    .map(([lvl, title]) => ({ level: parseInt(lvl), title }))
    .sort((a, b) => b.level - a.level)

  for (const { level: titleLevel, title } of titles) {
    if (level >= titleLevel) return title
  }
  return 'Beginner'
}

/**
 * Get user's current level info from the database
 * Compatible with databases that may not have level columns yet
 */
export async function getUserLevelInfo(
  supabase: SupabaseClient,
  userId: string
): Promise<LevelInfo> {
  // Get user's level data - select all columns we might need
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Use defaults if columns don't exist
  const level = (profile as Record<string, unknown>)?.current_level as number ?? 1
  const progress = (profile as Record<string, unknown>)?.level_progress as number ?? 0
  const currentWeek = profile?.current_week ?? 1

  // Count total exercises in current week
  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, workouts!inner(user_id, week_number)')
    .eq('workouts.user_id', userId)
    .eq('workouts.week_number', currentWeek)

  const totalExercisesInWeek = exercises?.length ?? 18 // Default to 18 (6 exercises × 3 days)

  return {
    level: Number(level) || 1,
    currentProgress: Number(progress) || 0,
    totalExercisesInWeek,
  }
}

/**
 * Award level progress when user increases weight on an exercise.
 * Called when user manually increases weight or accepts a weight recommendation.
 *
 * Formula: increment = 100 / total_exercises_in_week
 * When progress >= 100, level up and reset progress
 */
export async function awardLevelProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<{ newLevel: number; newProgress: number; leveledUp: boolean }> {
  // Get current level info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) {
    throw new Error('Profile not found')
  }

  const profileData = profile as Record<string, unknown>
  const currentLevel = Number(profileData.current_level) || 1
  let currentProgress = Number(profileData.level_progress) || 0
  const currentWeek = profile.current_week ?? 1

  // Count total unique exercises in current week
  const { data: exercises } = await supabase
    .from('exercises')
    .select('name, workouts!inner(user_id, week_number)')
    .eq('workouts.user_id', userId)
    .eq('workouts.week_number', currentWeek)

  // Count unique exercise names (same exercise across days counts as 1)
  const uniqueExercises = new Set(exercises?.map(e => e.name) ?? [])
  const totalExercisesInWeek = uniqueExercises.size || 18

  // Calculate increment
  const increment = 100 / totalExercisesInWeek
  currentProgress += increment

  let newLevel = currentLevel
  let leveledUp = false

  // Check for level up
  if (currentProgress >= 100) {
    newLevel = currentLevel + 1
    currentProgress = currentProgress - 100 // Carry over excess progress
    leveledUp = true
  }

  // Try to update profile - columns might not exist yet
  try {
    await supabase
      .from('profiles')
      .update({
        current_level: newLevel,
        level_progress: currentProgress,
      })
      .eq('id', userId)
  } catch (error) {
    // If columns don't exist, log but don't crash
    console.warn('Could not update level progress - columns may not exist:', error)
  }

  return {
    newLevel,
    newProgress: currentProgress,
    leveledUp,
  }
}

/**
 * Initialize level for new users (called on signup)
 */
export async function initializeUserLevel(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await supabase
    .from('profiles')
    .update({
      current_level: 1,
      level_progress: 0,
    })
    .eq('id', userId)
}
