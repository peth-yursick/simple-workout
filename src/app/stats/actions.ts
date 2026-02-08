'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateDashboardStats, TimeFilter, DashboardStats } from '@/lib/utils/statsCalculations'
import * as programsApi from '@/lib/api/programs'

export async function fetchStatsAction(filter: TimeFilter): Promise<DashboardStats> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get current program to determine days per week
  const program = await programsApi.getCurrentProgram(supabase, user.id)
  const daysPerWeek = program?.days_per_week ?? 3

  return calculateDashboardStats(supabase, user.id, filter, daysPerWeek)
}
