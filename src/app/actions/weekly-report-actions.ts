'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { awardLevelProgress } from '@/lib/utils/levelProgress'

export async function submitWeeklyReport(data: {
  weekNumber: number
  programId: string | null
  difficultyRating: number
  energyLevel: number
  sleepQuality: number
  stressLevel: number
  sorenessLevel: number
  notes: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get user's profile to check for program_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_program_id')
    .eq('id', user.id)
    .single()

  const actualProgramId = profile?.current_program_id || data.programId

  // Create weekly report
  const { error: reportError } = await supabase
    .from('weekly_reports')
    .insert({
      user_id: user.id,
      program_id: actualProgramId,
      week_number: data.weekNumber,
      difficulty_rating: data.difficultyRating,
      energy_level: data.energyLevel,
      sleep_quality: data.sleepQuality,
      stress_level: data.stressLevel,
      soreness_level: data.sorenessLevel,
      notes: data.notes || null,
      submitted_at: new Date().toISOString(),
    })

  if (reportError) throw reportError

  // Check for level up
  const levelResult = await awardLevelProgress(supabase, user.id)

  // Create workouts for next week
  const { data: newWorkouts } = await supabase
    .from('workouts')
    .insert([
      { user_id: user.id, week_number: data.weekNumber + 1, day_number: 1, program_id: actualProgramId },
      { user_id: user.id, week_number: data.weekNumber + 1, day_number: 2, program_id: actualProgramId },
      { user_id: user.id, week_number: data.weekNumber + 1, day_number: 3, program_id: actualProgramId },
    ])
    .select()

  if (!newWorkouts) throw new Error('Failed to create workouts for next week')

  // Update program's current_week if user has a program
  if (actualProgramId) {
    await supabase
      .from('programs')
      .update({ current_week: data.weekNumber + 1 })
      .eq('id', actualProgramId)
  } else {
    // Legacy: update profile's current_week
    await supabase
      .from('profiles')
      .update({ current_week: data.weekNumber + 1 })
      .eq('id', user.id)
  }

  // Notify coach about weekly report
  const { data: coachRelation } = await supabase
    .from('coach_athlete')
    .select('coach_id')
    .eq('athlete_id', user.id)
    .eq('status', 'active')
    .single()

  if (coachRelation?.coach_id) {
    const userName = user.email?.split('@')[0] || 'Athlete'
    await supabase.from('notifications').insert({
      user_id: coachRelation.coach_id,
      type: 'weekly_report_submitted',
      title: 'New Weekly Report',
      message: `${userName} submitted their Week ${data.weekNumber} report.`,
      metadata: {
        week_number: data.weekNumber,
        athlete_id: user.id,
        difficulty_rating: data.difficultyRating,
      },
      read: false,
    })
  }

  revalidatePath('/')
  return { success: true, leveledUp: levelResult.leveledUp, newLevel: levelResult.newLevel }
}
