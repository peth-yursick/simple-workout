import { SupabaseClient } from '@supabase/supabase-js'
import { Program, ProgramWithWeeks, ProgramStatus } from '@/lib/types/database'
import { mapSupabaseError } from '@/lib/errors'

export async function getPrograms(
  supabase: SupabaseClient,
  userId: string
): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', userId)
    .order('order')

  if (error) throw mapSupabaseError(error)
  return data as Program[]
}

export async function getProgram(
  supabase: SupabaseClient,
  programId: string
): Promise<Program | null> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as Program
}

export async function getProgramWithWeeks(
  supabase: SupabaseClient,
  programId: string
): Promise<ProgramWithWeeks | null> {
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      week_templates (
        *,
        exercise_templates (*)
      )
    `)
    .eq('id', programId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const program = data as ProgramWithWeeks

  // Sort week templates by week_number and exercises by day_number then order
  if (program?.week_templates) {
    program.week_templates.sort((a, b) => a.week_number - b.week_number)
    program.week_templates.forEach(week => {
      if (week.exercise_templates) {
        week.exercise_templates.sort((a, b) => {
          if (a.day_number !== b.day_number) return a.day_number - b.day_number
          return a.order - b.order
        })
      }
    })
  }

  return program
}

export async function getCurrentProgram(
  supabase: SupabaseClient,
  userId: string
): Promise<Program | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_program_id')
    .eq('id', userId)
    .single()

  if (!profile?.current_program_id) return null

  return getProgram(supabase, profile.current_program_id)
}

export async function getCurrentProgramWithWeeks(
  supabase: SupabaseClient,
  userId: string
): Promise<ProgramWithWeeks | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_program_id')
    .eq('id', userId)
    .single()

  if (!profile?.current_program_id) return null

  return getProgramWithWeeks(supabase, profile.current_program_id)
}

export async function createProgram(
  supabase: SupabaseClient,
  data: {
    user_id: string
    name: string
    total_weeks: number
    days_per_week?: number
    order?: number
    status?: ProgramStatus
  }
): Promise<Program> {
  // Get next order number if not provided
  if (data.order === undefined) {
    const { data: existing } = await supabase
      .from('programs')
      .select('order')
      .eq('user_id', data.user_id)
      .order('order', { ascending: false })
      .limit(1)

    data.order = (existing?.[0]?.order || 0) + 1
  }

  const { data: program, error } = await supabase
    .from('programs')
    .insert({
      user_id: data.user_id,
      name: data.name,
      total_weeks: data.total_weeks,
      days_per_week: data.days_per_week ?? 3,
      order: data.order,
      status: data.status || 'upcoming'
    })
    .select()
    .single()

  if (error) throw mapSupabaseError(error)
  return program as Program
}

export async function updateProgram(
  supabase: SupabaseClient,
  programId: string,
  updates: Partial<Pick<Program, 'name' | 'current_week' | 'status'>>
): Promise<Program> {
  const { data, error } = await supabase
    .from('programs')
    .update(updates)
    .eq('id', programId)
    .select()
    .single()

  if (error) throw mapSupabaseError(error)
  return data as Program
}

export async function advanceProgramWeek(
  supabase: SupabaseClient,
  programId: string
): Promise<{ program: Program; isComplete: boolean }> {
  const { data: program } = await supabase
    .from('programs')
    .select('current_week, total_weeks')
    .eq('id', programId)
    .single()

  if (!program) throw new Error('Program not found')

  const newWeek = program.current_week + 1
  const isComplete = newWeek > program.total_weeks

  const { data, error } = await supabase
    .from('programs')
    .update({
      current_week: isComplete ? program.total_weeks : newWeek,
      status: isComplete ? 'completed' : 'active'
    })
    .eq('id', programId)
    .select()
    .single()

  if (error) throw mapSupabaseError(error)
  return { program: data as Program, isComplete }
}

export async function getNextProgram(
  supabase: SupabaseClient,
  userId: string,
  currentOrder: number
): Promise<Program | null> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'upcoming')
    .gt('order', currentOrder)
    .order('order')
    .limit(1)

  if (error) throw mapSupabaseError(error)
  if (!data || data.length === 0) return null
  return data[0] as Program
}

export async function activateProgram(
  supabase: SupabaseClient,
  userId: string,
  programId: string
): Promise<void> {
  // Update profile to point to this program
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ current_program_id: programId })
    .eq('id', userId)

  if (profileError) throw profileError

  // Set program status to active
  const { error: programError } = await supabase
    .from('programs')
    .update({ status: 'active' })
    .eq('id', programId)

  if (programError) throw programError
}

export async function deleteProgram(
  supabase: SupabaseClient,
  programId: string
): Promise<void> {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', programId)

  if (error) throw mapSupabaseError(error)
}

export async function deleteAllUserPrograms(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('user_id', userId)

  if (error) throw mapSupabaseError(error)
}
