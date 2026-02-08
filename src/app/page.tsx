import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HomeHeader } from '@/components/workout/HomeHeader'
import { DayList } from '@/components/workout/DayList'
import { getWorkoutsWithProgress } from '@/lib/api/workouts'
import { getCurrentProgram } from '@/lib/api/programs'
import { getUserLevelInfo, getLevelTitle } from '@/lib/utils/levelProgress'

function getUsernameFromEmail(email: string | undefined): string {
  if (!email) return 'there'
  // Extract name from email (before @)
  const localPart = email.split('@')[0]
  // Capitalize first letter and replace dots/underscores with spaces
  const name = localPart
    .replace(/[._]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
  return name
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_week, current_program_id')
    .eq('id', user.id)
    .single()

  // Check if user has a program (new model) or just week (legacy)
  const currentProgram = profile?.current_program_id
    ? await getCurrentProgram(supabase, user.id)
    : null

  // Use program's current week if available, otherwise use profile's current_week
  const currentWeek = currentProgram?.current_week ?? profile?.current_week ?? 1
  const totalWeeks = currentProgram?.total_weeks ?? undefined
  const programName = currentProgram?.name ?? undefined
  const programId = currentProgram?.id ?? undefined

  // Get all workouts for current week to check completion status
  let weekWorkouts
  if (programId) {
    // New model: filter by program_id
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('program_id', programId)
      .eq('week_number', currentWeek)

    weekWorkouts = data
  } else {
    // Legacy model: filter by week_number only
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_number', currentWeek)

    weekWorkouts = data
  }

  // Check if all days are complete or skipped - if so, redirect to week transition
  if (weekWorkouts && weekWorkouts.length > 0) {
    const allDaysDone = weekWorkouts.every(w => {
      return w.completed_at !== null || w.skipped_at !== null
    })

    if (allDaysDone) {
      // Redirect to complete page of the first workout to trigger week transition
      redirect(`/workout/${weekWorkouts[0].id}/complete`)
    }
  }

  // Get workouts for current week and level info in parallel
  const [workoutsWithProgress, levelInfo] = await Promise.all([
    getWorkoutsWithProgress(supabase, user.id, currentWeek),
    getUserLevelInfo(supabase, user.id),
  ])

  const username = getUsernameFromEmail(user.email)

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header with edit mode toggle and level progress */}
        <HomeHeader
          username={username}
          programName={programName}
          currentWeek={currentWeek}
          totalWeeks={totalWeeks}
          level={levelInfo.level}
          progress={levelInfo.currentProgress}
          title={getLevelTitle(levelInfo.level)}
        />

        {/* Workouts */}
        <DayList
          workoutsWithProgress={workoutsWithProgress}
          currentWeek={currentWeek}
          programId={programId}
        />
      </div>
    </div>
  )
}
