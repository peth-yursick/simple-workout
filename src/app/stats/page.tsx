import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { calculateDashboardStats } from '@/lib/utils/statsCalculations'
import { fetchStatsAction } from './actions'

export default async function StatsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch initial stats (all-time)
  const initialStats = await calculateDashboardStats(supabase, user.id, 'all-time')

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-bold text-white">Your Stats</h1>
          <p className="text-gray-400 text-sm mt-1">Track your workout progress</p>
        </header>

        {/* Dashboard */}
        <Dashboard
          initialStats={initialStats}
          fetchStats={fetchStatsAction}
        />
      </div>
    </div>
  )
}
