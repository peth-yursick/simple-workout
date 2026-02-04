import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAthleteCoach, getAthleteWeeklyReports, getAthleteVideos } from '@/lib/api/coach'
import { AthleteDetail } from '@/components/coach/AthleteDetail'

export default async function AthletePage({
  params,
}: {
  params: Promise<{ athleteId: string }>
}) {
  const { athleteId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify that the current user is the coach of this athlete
  const coachRelation = await getAthleteCoach(supabase, athleteId)
  if (!coachRelation || coachRelation.coach_id !== user.id) {
    redirect('/coach')
  }

  // Fetch initial data
  const [reports, videos] = await Promise.all([
    getAthleteWeeklyReports(supabase, athleteId),
    getAthleteVideos(supabase, athleteId),
  ])

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AthleteDetail
          athleteId={athleteId}
          coachId={user.id}
          initialReports={reports}
          initialVideos={videos}
        />
      </div>
    </div>
  )
}
