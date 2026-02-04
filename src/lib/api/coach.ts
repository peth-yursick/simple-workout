import { SupabaseClient } from '@supabase/supabase-js'
import { CoachAthlete } from '@/lib/types/database'

/**
 * Generate a unique invitation code for an athlete
 */
export async function generateInvitationCode(
  supabase: SupabaseClient,
  athleteId: string
): Promise<string> {
  // Generate a random 8-character code
  const code = Math.random().toString(36).substring(2, 10).toUpperCase()

  // Store in database
  const { error } = await supabase
    .from('invitation_codes')
    .insert({
      code,
      athlete_id: athleteId,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    })

  if (error) {
    // If code already exists (unlikely), try again
    if (error.code === '23505') {
      return generateInvitationCode(supabase, athleteId)
    }
    throw error
  }

  return code
}

/**
 * Look up invitation code and return athlete info
 */
export async function lookupInvitationCode(
  supabase: SupabaseClient,
  code: string
): Promise<{ athlete_id: string; athlete: { email: string; current_level: number }[] } | null> {
  const { data, error } = await supabase
    .from('invitation_codes')
    .select(`
      athlete_id,
      athlete:profiles!invitation_codes_athlete_id_fkey (
        email,
        current_level
      )
    `)
    .eq('code', code)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as { athlete_id: string; athlete: { email: string; current_level: number }[] } | null
}

/**
 * Get all athletes for a coach
 */
export async function getCoachAthletes(
  supabase: SupabaseClient,
  coachId: string
): Promise<Array<{ athlete_id: string; status: string; athlete: { email: string; current_level: number }[] }>> {
  const { data, error } = await supabase
    .from('coach_athlete')
    .select(`
      athlete_id,
      status,
      athlete:profiles!coach_athlete_athlete_id_fkey (
        email,
        current_level
      )
    `)
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Array<{ athlete_id: string; status: string; athlete: { email: string; current_level: number }[] }>
}

/**
 * Get coach for an athlete
 */
export async function getAthleteCoach(
  supabase: SupabaseClient,
  athleteId: string
): Promise<{ coach_id: string; coach: { email: string }[] } | null> {
  const { data, error } = await supabase
    .from('coach_athlete')
    .select(`
      coach_id,
      coach:profiles!coach_athlete_coach_id_fkey (
        email
      )
    `)
    .eq('athlete_id', athleteId)
    .eq('status', 'active')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as { coach_id: string; coach: { email: string }[] } | null
}

/**
 * Send invitation to athlete
 */
export async function inviteAthlete(
  supabase: SupabaseClient,
  coachId: string,
  athleteEmail: string
): Promise<CoachAthlete> {
  // First find the athlete by email
  const { data: athlete, error: athleteError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', athleteEmail) // Email is stored as id in profiles for now
    .single()

  if (athleteError || !athlete) {
    throw new Error('Athlete not found')
  }

  // Check if relationship already exists
  const { data: existing } = await supabase
    .from('coach_athlete')
    .select('*')
    .eq('coach_id', coachId)
    .eq('athlete_id', athlete.id)
    .single()

  if (existing) {
    throw new Error('Already connected to this athlete')
  }

  // Create pending invitation
  const { data, error } = await supabase
    .from('coach_athlete')
    .insert({
      coach_id: coachId,
      athlete_id: athlete.id,
      status: 'pending',
      can_edit: false,
    })
    .select()
    .single()

  if (error) throw error

  // Create notification for athlete
  await supabase.from('notifications').insert({
    user_id: athlete.id,
    type: 'athlete_added',
    title: 'Coach Invitation',
    message: `A coach has invited you to connect.`,
    metadata: { coach_id: coachId },
    read: false,
  })

  return data as CoachAthlete
}

/**
 * Accept coach invitation
 */
export async function acceptCoachInvitation(
  supabase: SupabaseClient,
  coachId: string,
  athleteId: string
): Promise<CoachAthlete> {
  const { data, error } = await supabase
    .from('coach_athlete')
    .update({
      status: 'active',
      started_at: new Date().toISOString(),
    })
    .eq('coach_id', coachId)
    .eq('athlete_id', athleteId)
    .select()
    .single()

  if (error) throw error

  return data as CoachAthlete
}

/**
 * Reject coach invitation
 */
export async function rejectCoachInvitation(
  supabase: SupabaseClient,
  coachId: string,
  athleteId: string
): Promise<void> {
  const { error } = await supabase
    .from('coach_athlete')
    .delete()
    .eq('coach_id', coachId)
    .eq('athlete_id', athleteId)

  if (error) throw error
}

/**
 * End coaching relationship
 */
export async function endCoaching(
  supabase: SupabaseClient,
  coachId: string,
  athleteId: string
): Promise<void> {
  const { error } = await supabase
    .from('coach_athlete')
    .update({
      status: 'ended',
      ended_at: new Date().toISOString(),
    })
    .eq('coach_id', coachId)
    .eq('athlete_id', athleteId)

  if (error) throw error
}

/**
 * Get pending invitations for an athlete
 */
export async function getPendingInvitations(
  supabase: SupabaseClient,
  athleteId: string
): Promise<Array<{ id: string; coach_id: string; coach: { email: string }[] }>> {
  const { data, error } = await supabase
    .from('coach_athlete')
    .select(`
      id,
      coach_id,
      coach:profiles!coach_athlete_coach_id_fkey (
        email
      )
    `)
    .eq('athlete_id', athleteId)
    .eq('status', 'pending')

  if (error) throw error
  return data as Array<{ id: string; coach_id: string; coach: { email: string }[] }>
}

/**
 * Get weekly reports for an athlete
 */
export async function getAthleteWeeklyReports(
  supabase: SupabaseClient,
  athleteId: string,
  limit = 10
): Promise<Array<{
  id: string
  week_number: number
  difficulty_rating: number | null
  energy_level: number | null
  notes: string | null
  coach_notes: string | null
  submitted_at: string
}>> {
  const { data, error } = await supabase
    .from('weekly_reports')
    .select('id, week_number, difficulty_rating, energy_level, notes, coach_notes, submitted_at')
    .eq('user_id', athleteId)
    .order('week_number', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Get videos for an athlete
 */
export async function getAthleteVideos(
  supabase: SupabaseClient,
  athleteId: string,
  limit = 20
): Promise<Array<{
  id: string
  exercise_id: string | null
  file_path: string
  duration: number
  weight_kg: number | null
  reps: number | null
  coach_reviewed: boolean
  coach_comment: string | null
  created_at: string
}>> {
  const { data, error } = await supabase
    .from('video_uploads')
    .select('id, exercise_id, file_path, duration, weight_kg, reps, coach_reviewed, coach_comment, created_at')
    .eq('user_id', athleteId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
