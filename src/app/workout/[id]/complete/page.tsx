import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getWorkout } from '@/lib/api/workouts'
import { analyzeWeekForRecommendations } from '@/lib/utils/exerciseAnalysis'
import { WeekTransitionModal } from '@/components/workout/WeekTransitionModal'
import { WeeklyReportModal } from '@/components/weekly/WeeklyReportModal'
import { WorkoutCompleteView } from './WorkoutCompleteView'

interface CompletePageProps {
  params: Promise<{ id: string }>
}

export default async function CompletePage({ params }: CompletePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const workout = await getWorkout(supabase, id)
  if (!workout) {
    notFound()
  }

  // Handle case where skipped_at column might not exist in database yet
  const workoutSkippedAt = 'skipped_at' in workout ? workout.skipped_at : null

  // Mark the current workout as complete if not already complete or skipped
  if (!workout.completed_at && !workoutSkippedAt) {
    await supabase
      .from('workouts')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', workout.id)
  }

  // Check if all 3 days of this week are now complete or skipped
  const { data: weekWorkouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_number', workout.week_number)

  // A day is "done" if it's completed, skipped, or is the current workout being completed
  const allComplete = weekWorkouts?.length === 3 &&
    weekWorkouts.every(w => {
      const skippedAt = 'skipped_at' in w ? w.skipped_at : null
      return w.completed_at !== null || skippedAt !== null || w.id === workout.id
    })

  if (allComplete) {
    // Check if user has an active coach
    const { data: coachRelation } = await supabase
      .from('coach_athlete')
      .select('coach_id')
      .eq('athlete_id', user.id)
      .eq('status', 'active')
      .single()

    const hasCoach = !!coachRelation?.coach_id

    if (hasCoach) {
      // Coach mode: show weekly report form (no weight recommendations)
      return (
        <WeeklyReportModal
          weekNumber={workout.week_number}
          programId={workout.program_id}
        />
      )
    } else {
      // Standalone mode: show weight recommendations
      const recommendations = await analyzeWeekForRecommendations(
        supabase,
        user.id,
        workout.week_number
      )

      return (
        <WeekTransitionModal
          weekNumber={workout.week_number}
          recommendations={recommendations}
        />
      )
    }
  }

  // Regular workout completion (not end of week yet)
  return (
    <WorkoutCompleteView
      workoutId={workout.id}
      dayNumber={workout.day_number}
      weekNumber={workout.week_number}
    />
  )
}
