import { SupabaseClient } from '@supabase/supabase-js'
import { WeekTemplate, WeekTemplateWithExercises, ExerciseTemplate } from '@/lib/types/database'

export async function getWeekTemplates(
  supabase: SupabaseClient,
  programId: string
): Promise<WeekTemplate[]> {
  const { data, error } = await supabase
    .from('week_templates')
    .select('*')
    .eq('program_id', programId)
    .order('week_number')

  if (error) throw error
  return data as WeekTemplate[]
}

export async function getWeekTemplate(
  supabase: SupabaseClient,
  programId: string,
  weekNumber: number
): Promise<WeekTemplateWithExercises | null> {
  const { data, error } = await supabase
    .from('week_templates')
    .select(`
      *,
      exercise_templates (*)
    `)
    .eq('program_id', programId)
    .eq('week_number', weekNumber)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const weekTemplate = data as WeekTemplateWithExercises

  // Sort exercise templates by day_number then order
  if (weekTemplate?.exercise_templates) {
    weekTemplate.exercise_templates.sort((a, b) => {
      if (a.day_number !== b.day_number) return a.day_number - b.day_number
      return a.order - b.order
    })
  }

  return weekTemplate
}

export async function getWeekTemplateById(
  supabase: SupabaseClient,
  weekTemplateId: string
): Promise<WeekTemplateWithExercises | null> {
  const { data, error } = await supabase
    .from('week_templates')
    .select(`
      *,
      exercise_templates (*)
    `)
    .eq('id', weekTemplateId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const weekTemplate = data as WeekTemplateWithExercises

  // Sort exercise templates by day_number then order
  if (weekTemplate?.exercise_templates) {
    weekTemplate.exercise_templates.sort((a, b) => {
      if (a.day_number !== b.day_number) return a.day_number - b.day_number
      return a.order - b.order
    })
  }

  return weekTemplate
}

export async function createWeekTemplate(
  supabase: SupabaseClient,
  data: {
    program_id: string
    week_number: number
  }
): Promise<WeekTemplate> {
  const { data: weekTemplate, error } = await supabase
    .from('week_templates')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return weekTemplate as WeekTemplate
}

export async function createWeekTemplates(
  supabase: SupabaseClient,
  programId: string,
  weekCount: number
): Promise<WeekTemplate[]> {
  const templates = Array.from({ length: weekCount }, (_, i) => ({
    program_id: programId,
    week_number: i + 1
  }))

  const { data, error } = await supabase
    .from('week_templates')
    .insert(templates)
    .select()

  if (error) throw error
  return data as WeekTemplate[]
}

export async function getExerciseTemplatesForDay(
  supabase: SupabaseClient,
  weekTemplateId: string,
  dayNumber: number
): Promise<ExerciseTemplate[]> {
  const { data, error } = await supabase
    .from('exercise_templates')
    .select('*')
    .eq('week_template_id', weekTemplateId)
    .eq('day_number', dayNumber)
    .order('order')

  if (error) throw error
  return data as ExerciseTemplate[]
}

export async function createExerciseTemplate(
  supabase: SupabaseClient,
  data: {
    week_template_id: string
    day_number: number
    name: string
    order: number
    sets: number
    weight_kg: number
    rep_min: number
    rep_max: number
    target_effort_min: number
    target_effort_max: number
  }
): Promise<ExerciseTemplate> {
  const { data: template, error } = await supabase
    .from('exercise_templates')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return template as ExerciseTemplate
}

export async function createExerciseTemplates(
  supabase: SupabaseClient,
  templates: {
    week_template_id: string
    day_number: number
    name: string
    order: number
    sets: number
    weight_kg: number
    rep_min: number
    rep_max: number
    target_effort_min: number
    target_effort_max: number
  }[]
): Promise<ExerciseTemplate[]> {
  if (templates.length === 0) return []

  const { data, error } = await supabase
    .from('exercise_templates')
    .insert(templates)
    .select()

  if (error) throw error
  return data as ExerciseTemplate[]
}

export async function deleteWeekTemplate(
  supabase: SupabaseClient,
  weekTemplateId: string
): Promise<void> {
  const { error } = await supabase
    .from('week_templates')
    .delete()
    .eq('id', weekTemplateId)

  if (error) throw error
}

// Get unique days that have exercises in a week template
export async function getDaysInWeekTemplate(
  supabase: SupabaseClient,
  weekTemplateId: string
): Promise<number[]> {
  const { data, error } = await supabase
    .from('exercise_templates')
    .select('day_number')
    .eq('week_template_id', weekTemplateId)

  if (error) throw error

  // Get unique day numbers and sort them
  const uniqueDays = Array.from(new Set((data as { day_number: number }[]).map(d => d.day_number)))
  return uniqueDays.sort((a, b) => a - b)
}
