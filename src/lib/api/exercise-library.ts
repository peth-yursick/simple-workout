import { SupabaseClient } from '@supabase/supabase-js'
import { ExerciseLibrary } from '@/lib/types/database'

export async function getAllExercises(
  supabase: SupabaseClient
): Promise<ExerciseLibrary[]> {
  const { data, error } = await supabase
    .from('exercise_library')
    .select('*')
    .order('name')

  if (error) throw error
  return data as ExerciseLibrary[]
}

export async function searchExercises(
  supabase: SupabaseClient,
  query: string
): Promise<ExerciseLibrary[]> {
  if (!query.trim()) return getAllExercises(supabase)

  // Search by name and aliases
  const { data, error } = await supabase
    .from('exercise_library')
    .select('*')
    .or(`name.ilike.%${query}%, aliases.cs.{${query}}`)
    .order('name')

  if (error) throw error
  return data as ExerciseLibrary[]
}

export async function getExercisesByCategory(
  supabase: SupabaseClient,
  category: string
): Promise<ExerciseLibrary[]> {
  const { data, error } = await supabase
    .from('exercise_library')
    .select('*')
    .eq('category', category)
    .order('name')

  if (error) throw error
  return data as ExerciseLibrary[]
}

export async function getExercisesByMovementType(
  supabase: SupabaseClient,
  movementType: string
): Promise<ExerciseLibrary[]> {
  const { data, error } = await supabase
    .from('exercise_library')
    .select('*')
    .eq('movement_type', movementType)
    .order('name')

  if (error) throw error
  return data as ExerciseLibrary[]
}

export async function getExercisesByEquipment(
  supabase: SupabaseClient,
  equipment: string
): Promise<ExerciseLibrary[]> {
  const { data, error } = await supabase
    .from('exercise_library')
    .select('*')
    .eq('equipment', equipment)
    .order('name')

  if (error) throw error
  return data as ExerciseLibrary[]
}

export async function getEquivalentExercises(
  supabase: SupabaseClient,
  exerciseName: string
): Promise<ExerciseLibrary[]> {
  // First find the base exercise
  const { data: baseExercise } = await supabase
    .from('exercise_library')
    .select('*')
    .ilike('name', exerciseName)
    .single()

  if (!baseExercise) return []

  // Find all exercises that share the same base exercise
  const { data, error } = await supabase
    .from('exercise_library')
    .select('*')
    .or(`id.eq.${baseExercise.id},base_exercise_id.eq.${baseExercise.id},base_exercise_id.eq.${baseExercise.base_exercise_id}`)
    .neq('id', baseExercise.id)
    .order('name')

  if (error) throw error
  return (data as ExerciseLibrary[]) || []
}

export async function suggestExerciseSwap(
  supabase: SupabaseClient,
  currentExerciseName: string,
  availableEquipment?: string[]
): Promise<ExerciseLibrary | null> {
  const current = await supabase
    .from('exercise_library')
    .select('*')
    .ilike('name', currentExerciseName)
    .single()

  if (!current) return null

  // Try to find equivalent exercise with matching equipment
  let query = supabase
    .from('exercise_library')
    .select('*')

  if (current.base_exercise_id) {
    // Find other exercises with same base
    query = query.eq('base_exercise_id', current.base_exercise_id)
  } else {
    // Find exercises that have this as base
    query = query.eq('base_exercise_id', current.id)
  }

  // Filter by available equipment if specified
  if (availableEquipment && availableEquipment.length > 0) {
    query = query.in('equipment', availableEquipment)
  }

  const { data } = await query.limit(1).single()

  return data as ExerciseLibrary | null
}
