'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateDashboardStats, TimeFilter, DashboardStats } from '@/lib/utils/statsCalculations'

export async function fetchStatsAction(filter: TimeFilter): Promise<DashboardStats> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  return calculateDashboardStats(supabase, user.id, filter)
}
