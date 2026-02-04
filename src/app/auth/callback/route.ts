import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if this is a new user (profile just created by trigger)
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_week')
        .eq('id', data.user.id)
        .single()

      // If user is at week 1 and has no workouts, create Day 1 (blank)
      if (profile?.current_week === 1) {
        const { data: existingWorkouts } = await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', data.user.id)
          .limit(1)

        if (!existingWorkouts?.length) {
          // Create just Day 1 with no exercises
          await supabase.from('workouts').insert({
            user_id: data.user.id,
            week_number: 1,
            day_number: 1,
          })
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth error - redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
