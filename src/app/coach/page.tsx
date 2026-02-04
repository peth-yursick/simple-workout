import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCoachAthletes } from '@/lib/api/coach'
import { CoachDashboard } from '@/components/coach/CoachDashboard'

export default async function CoachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is a coach (has athletes or pending invitations)
  const athletes = await getCoachAthletes(supabase, user.id)

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Coach Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your athletes</p>
        </header>

        <CoachDashboard
          coachId={user.id}
          initialAthletes={athletes}
        />
      </div>
    </div>
  )
}
