'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import * as workoutsApi from '@/lib/api/workouts'
import * as exercisesApi from '@/lib/api/exercises'
import * as setsApi from '@/lib/api/exercise-sets'
import * as programsApi from '@/lib/api/programs'
import * as weekTemplatesApi from '@/lib/api/week-templates'
import { ExerciseStatus, Workout } from '@/lib/types/database'
import { ParsedProgram } from '@/lib/utils/spreadsheetParser'
import { seedUserWorkouts } from '@/lib/utils/seedData'
import { awardLevelProgress } from '@/lib/utils/levelProgress'

// Workout Actions

export async function createWeekWorkouts(weekNumber: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const workouts = await workoutsApi.createWeekWorkouts(supabase, user.id, weekNumber)
  revalidatePath('/')
  return workouts
}

export async function completeWorkout(workoutId: string) {
  const supabase = await createClient()
  const workout = await workoutsApi.completeWorkout(supabase, workoutId)
  revalidatePath(`/workout/${workoutId}`)
  revalidatePath('/')
  return workout
}

export async function skipWorkout(workoutId: string) {
  const supabase = await createClient()

  // Mark workout as skipped and also mark all exercises as skipped
  const { data: workout } = await supabase
    .from('workouts')
    .update({ skipped_at: new Date().toISOString() })
    .eq('id', workoutId)
    .select()
    .single()

  // Mark all exercises in this workout as skipped
  await supabase
    .from('exercises')
    .update({ status: 'skipped' })
    .eq('workout_id', workoutId)

  // Mark all sets in this workout as skipped
  const { data: exercises } = await supabase
    .from('exercises')
    .select('id')
    .eq('workout_id', workoutId)

  if (exercises) {
    for (const exercise of exercises) {
      await supabase
        .from('exercise_sets')
        .update({ skipped: true })
        .eq('exercise_id', exercise.id)
    }
  }

  revalidatePath(`/workout/${workoutId}`)
  revalidatePath('/')
  return workout
}

export async function duplicateWorkoutsToNextWeek(fromWeek: number, toWeek: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const workouts = await workoutsApi.duplicateWorkoutsToNextWeek(supabase, user.id, fromWeek, toWeek)
  revalidatePath('/')
  return workouts
}

export async function createDay(weekNumber: number, dayNumber: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: workout, error } = await supabase
    .from('workouts')
    .insert({
      user_id: user.id,
      week_number: weekNumber,
      day_number: dayNumber,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/')
  return workout
}

export async function deleteDay(workoutId: string) {
  const supabase = await createClient()

  // Delete all exercise sets for exercises in this workout
  const { data: exercises } = await supabase
    .from('exercises')
    .select('id')
    .eq('workout_id', workoutId)

  if (exercises) {
    for (const exercise of exercises) {
      await supabase
        .from('exercise_sets')
        .delete()
        .eq('exercise_id', exercise.id)
    }
  }

  // Delete all exercises in this workout
  await supabase
    .from('exercises')
    .delete()
    .eq('workout_id', workoutId)

  // Delete the workout
  await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)

  revalidatePath('/')
}

// Exercise Actions

export async function createExercise(data: {
  workout_id: string
  name: string
  sets: number
  weight_kg: number
  rep_min: number
  rep_max: number
  target_effort_min: number
  target_effort_max: number
  is_main_exercise?: boolean
  toughness_rating?: number
}) {
  const supabase = await createClient()
  const exercise = await exercisesApi.createExercise(supabase, data)
  revalidatePath(`/workout/${data.workout_id}`)
  return exercise
}

export async function updateExercise(
  exerciseId: string,
  workoutId: string,
  updates: Partial<{
    name: string
    sets: number
    weight_kg: number
    rep_min: number
    rep_max: number
    target_effort_min: number
    target_effort_max: number
    status: ExerciseStatus
    is_main_exercise: boolean
    toughness_rating: number
  }>
) {
  const supabase = await createClient()
  const exercise = await exercisesApi.updateExercise(supabase, exerciseId, updates)
  revalidatePath(`/workout/${workoutId}`)
  revalidatePath(`/exercise/${exerciseId}`)
  return exercise
}

export async function deleteExercise(exerciseId: string, workoutId: string) {
  const supabase = await createClient()
  await exercisesApi.deleteExercise(supabase, exerciseId)
  revalidatePath(`/workout/${workoutId}`)
}

export async function updateWorkout(
  workoutId: string,
  updates: {
    day_name?: string
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workouts')
    .update(updates)
    .eq('id', workoutId)
    .select()
    .single()

  if (error) throw error
  revalidatePath(`/workout/${workoutId}`)
  return data
}


export async function reorderExercises(workoutId: string, exerciseIds: string[]) {
  const supabase = await createClient()
  await exercisesApi.reorderExercises(supabase, workoutId, exerciseIds)
  revalidatePath(`/workout/${workoutId}`)
}

export async function skipExercise(exerciseId: string, workoutId: string) {
  const supabase = await createClient()
  const exercise = await exercisesApi.skipExercise(supabase, exerciseId)
  revalidatePath(`/workout/${workoutId}`)
  revalidatePath(`/exercise/${exerciseId}`)
  return exercise
}

// Exercise Set Actions

export async function completeSet(
  setId: string,
  exerciseId: string,
  workoutId: string,
  repsCompleted: number,
  rpe?: number,
  rir?: number,
  effortPercentage?: number
) {
  const supabase = await createClient()
  const set = await setsApi.completeSet(supabase, setId, repsCompleted, rpe, rir, effortPercentage)

  // Check if all sets are complete, update exercise status
  const isComplete = await setsApi.checkExerciseCompletion(supabase, exerciseId)
  if (isComplete) {
    await exercisesApi.updateExerciseStatus(supabase, exerciseId, 'complete')
  }

  revalidatePath(`/exercise/${exerciseId}`)
  revalidatePath(`/workout/${workoutId}`)
  return set
}

export async function skipSet(setId: string, exerciseId: string, workoutId: string) {
  const supabase = await createClient()
  const set = await setsApi.skipSet(supabase, setId)
  revalidatePath(`/exercise/${exerciseId}`)
  revalidatePath(`/workout/${workoutId}`)
  return set
}

export async function resetSet(setId: string, exerciseId: string, workoutId: string) {
  const supabase = await createClient()
  const set = await setsApi.resetSet(supabase, setId)

  // Reset exercise status to incomplete
  await exercisesApi.updateExerciseStatus(supabase, exerciseId, 'incomplete')

  revalidatePath(`/exercise/${exerciseId}`)
  revalidatePath(`/workout/${workoutId}`)
  return set
}

// Week Transition Actions

export async function startNextWeek(
  fromWeek: number,
  toWeek: number,
  weightUpdates: Record<string, number> // exercise_name -> new_weight
): Promise<{ workouts: Workout[]; leveledUp: boolean; newLevel: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get user profile to check for program_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_program_id')
    .eq('id', user.id)
    .single()

  // Duplicate workouts from current week to next week
  const newWorkouts = await workoutsApi.duplicateWorkoutsToNextWeek(supabase, user.id, fromWeek, toWeek, profile?.current_program_id || undefined)

  // Track unique exercises that got weight increases (for level progress)
  const exercisesWithWeightIncrease = new Set<string>()

  // Apply weight updates to the new week's exercises
  if (Object.keys(weightUpdates).length > 0) {
    for (const workout of newWorkouts) {
      const { data: exercises } = await supabase
        .from('exercises')
        .select('id, name')
        .eq('workout_id', workout.id)

      if (exercises) {
        for (const exercise of exercises) {
          const newWeight = weightUpdates[exercise.name]
          if (newWeight !== undefined) {
            await supabase
              .from('exercises')
              .update({ weight_kg: newWeight })
              .eq('id', exercise.id)
            // Track unique exercise names that got weight increases
            exercisesWithWeightIncrease.add(exercise.name)
          }
        }
      }
    }
  }

  // Award level progress for each unique exercise with weight increase
  let leveledUp = false
  let newLevel = 1
  for (let i = 0; i < exercisesWithWeightIncrease.size; i++) {
    const result = await awardLevelProgress(supabase, user.id)
    if (result.leveledUp) {
      leveledUp = true
      newLevel = result.newLevel
    }
  }

  // Update user's current_week
  await supabase
    .from('profiles')
    .update({ current_week: toWeek })
    .eq('id', user.id)

  // Also update programs table if user has a current program
  if (profile?.current_program_id) {
    await supabase
      .from('programs')
      .update({ current_week: toWeek })
    .eq('id', profile.current_program_id)
  }

  revalidatePath('/')
  return { workouts: newWorkouts, leveledUp, newLevel }
}

export async function checkWeekCompletion(weekNumber: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get all workouts for this week
  const { data: workouts } = await supabase
    .from('workouts')
    .select('id, day_number, completed_at')
    .eq('user_id', user.id)
    .eq('week_number', weekNumber)

  if (!workouts || workouts.length < 3) return false

  // Check if all 3 days are complete
  return workouts.every(w => w.completed_at !== null)
}

export async function seedDefaultWorkouts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await seedUserWorkouts(supabase, user.id)
  revalidatePath('/')
}

export async function importRoutine(
  days: {
    dayNumber: number
    exercises: {
      name: string
      sets: number
      weight_kg: number
      rep_min: number
      rep_max: number
      target_effort_min: number
      target_effort_max: number
      order: number
    }[]
  }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get user's current week
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_week')
    .eq('id', user.id)
    .single()

  const currentWeek = profile?.current_week ?? 1

  // Delete all existing workouts for this week (cascades to exercises and sets)
  const { data: existingWorkouts } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', user.id)
    .eq('week_number', currentWeek)

  if (existingWorkouts) {
    for (const workout of existingWorkouts) {
      // Delete exercise sets first
      const { data: exercises } = await supabase
        .from('exercises')
        .select('id')
        .eq('workout_id', workout.id)

      if (exercises) {
        for (const exercise of exercises) {
          await supabase
            .from('exercise_sets')
            .delete()
            .eq('exercise_id', exercise.id)
        }
      }

      // Delete exercises
      await supabase
        .from('exercises')
        .delete()
        .eq('workout_id', workout.id)

      // Delete workout
      await supabase
        .from('workouts')
        .delete()
        .eq('id', workout.id)
    }
  }

  // Create new workouts and exercises
  for (const day of days) {
    // Create workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        week_number: currentWeek,
        day_number: day.dayNumber,
      })
      .select()
      .single()

    if (workoutError) throw workoutError

    // Create exercises for this workout
    for (const ex of day.exercises) {
      const { data: exercise, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          workout_id: workout.id,
          name: ex.name,
          order: ex.order,
          sets: ex.sets,
          weight_kg: ex.weight_kg,
          rep_min: ex.rep_min,
          rep_max: ex.rep_max,
          target_effort_min: ex.target_effort_min,
          target_effort_max: ex.target_effort_max,
        })
        .select()
        .single()

      if (exerciseError) throw exerciseError

      // Create exercise sets
      const sets = Array.from({ length: ex.sets }, (_, i) => ({
        exercise_id: exercise.id,
        set_number: i + 1,
      }))

      const { error: setsError } = await supabase
        .from('exercise_sets')
        .insert(sets)

      if (setsError) throw setsError
    }
  }

  revalidatePath('/')
  return { success: true }
}

// Program Import Actions

export async function importPrograms(
  programs: ParsedProgram[]
): Promise<{ programIds: string[]; success: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Delete all existing programs for this user (cascades to week_templates and exercise_templates)
  await programsApi.deleteAllUserPrograms(supabase, user.id)

  // Also delete all existing workouts
  const { data: existingWorkouts } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', user.id)

  if (existingWorkouts) {
    for (const workout of existingWorkouts) {
      const { data: exercises } = await supabase
        .from('exercises')
        .select('id')
        .eq('workout_id', workout.id)

      if (exercises) {
        for (const exercise of exercises) {
          await supabase
            .from('exercise_sets')
            .delete()
            .eq('exercise_id', exercise.id)
        }
      }

      await supabase
        .from('exercises')
        .delete()
        .eq('workout_id', workout.id)

      await supabase
        .from('workouts')
        .delete()
        .eq('id', workout.id)
    }
  }

  const programIds: string[] = []

  for (let programIndex = 0; programIndex < programs.length; programIndex++) {
    const parsedProgram = programs[programIndex]

    // Create program
    const program = await programsApi.createProgram(supabase, {
      user_id: user.id,
      name: parsedProgram.name,
      total_weeks: parsedProgram.weeks.length,
      order: programIndex + 1,
      status: programIndex === 0 ? 'active' : 'upcoming'
    })

    // Create week templates
    const weekTemplates = await weekTemplatesApi.createWeekTemplates(
      supabase,
      program.id,
      parsedProgram.weeks.length
    )

    // Create exercise templates for each week
    for (const week of parsedProgram.weeks) {
      const weekTemplate = weekTemplates.find(wt => wt.week_number === week.weekNumber)
      if (!weekTemplate) continue

      for (const day of week.days) {
        for (const exercise of day.exercises) {
          await weekTemplatesApi.createExerciseTemplate(supabase, {
            week_template_id: weekTemplate.id,
            day_number: day.dayNumber,
            name: exercise.name,
            order: exercise.order,
            sets: exercise.sets,
            weight_kg: exercise.weight_kg,
            rep_min: exercise.rep_min,
            rep_max: exercise.rep_max,
            target_effort_min: exercise.target_effort_min,
            target_effort_max: exercise.target_effort_max
          })
        }
      }
    }

    programIds.push(program.id)
  }

  // Set first program as current and initialize workouts for week 1
  if (programIds.length > 0) {
    const firstProgramId = programIds[0]

    // Set as current program
    await supabase
      .from('profiles')
      .update({ current_program_id: firstProgramId })
      .eq('id', user.id)

    // Initialize workouts for first week
    await initializeWeekWorkouts(firstProgramId, 1)
  }

  revalidatePath('/')
  return { programIds, success: true }
}

// Initialize workouts for a specific week from templates
export async function initializeWeekWorkouts(
  programId: string,
  weekNumber: number
): Promise<Workout[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get week template with exercises
  const weekTemplate = await weekTemplatesApi.getWeekTemplate(supabase, programId, weekNumber)
  if (!weekTemplate) throw new Error('Week template not found')

  // Group exercises by day
  const exercisesByDay = new Map<number, typeof weekTemplate.exercise_templates>()
  for (const ex of weekTemplate.exercise_templates) {
    const dayExercises = exercisesByDay.get(ex.day_number) || []
    dayExercises.push(ex)
    exercisesByDay.set(ex.day_number, dayExercises)
  }

  const workouts: Workout[] = []

  // Create workout and exercises for each day
  for (const [dayNumber, exercises] of Array.from(exercisesByDay.entries())) {
    // Check if workout already exists
    const { data: existingWorkout } = await supabase
      .from('workouts')
      .select('id')
      .eq('user_id', user.id)
      .eq('program_id', programId)
      .eq('week_number', weekNumber)
      .eq('day_number', dayNumber)
      .single()

    if (existingWorkout) {
      // Workout already exists, skip
      continue
    }

    // Create workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        program_id: programId,
        week_number: weekNumber,
        day_number: dayNumber
      })
      .select()
      .single()

    if (workoutError) throw workoutError
    workouts.push(workout as Workout)

    // Create exercises from templates
    for (const template of exercises) {
      const { data: exercise, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          workout_id: workout.id,
          template_id: template.id,
          name: template.name,
          order: template.order,
          sets: template.sets,
          weight_kg: template.weight_kg,
          rep_min: template.rep_min,
          rep_max: template.rep_max,
          target_effort_min: template.target_effort_min,
          target_effort_max: template.target_effort_max
        })
        .select()
        .single()

      if (exerciseError) throw exerciseError

      // Create exercise sets
      const sets = Array.from({ length: template.sets }, (_, i) => ({
        exercise_id: exercise.id,
        set_number: i + 1
      }))

      const { error: setsError } = await supabase
        .from('exercise_sets')
        .insert(sets)

      if (setsError) throw setsError
    }
  }

  return workouts
}

// Start next week within a program or transition to next program
export async function startNextProgramWeek(
  programId: string,
  fromWeek: number,
  weightUpdates: Record<string, number>
): Promise<{
  workouts: Workout[]
  leveledUp: boolean
  newLevel: number
  programComplete: boolean
  nextProgramId: string | null
  nextProgramName: string | null
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get program info
  const program = await programsApi.getProgram(supabase, programId)
  if (!program) throw new Error('Program not found')

  const toWeek = fromWeek + 1
  const programComplete = toWeek > program.total_weeks

  let newWorkouts: Workout[] = []
  let leveledUp = false
  let newLevel = 1
  let nextProgramId: string | null = null
  let nextProgramName: string | null = null

  if (programComplete) {
    // Mark current program complete
    await programsApi.updateProgram(supabase, programId, { status: 'completed' })

    // Find and activate next program
    const nextProgram = await programsApi.getNextProgram(supabase, user.id, program.order)

    if (nextProgram) {
      nextProgramId = nextProgram.id
      nextProgramName = nextProgram.name

      await programsApi.activateProgram(supabase, user.id, nextProgram.id)

      // Initialize first week of new program
      newWorkouts = await initializeWeekWorkouts(nextProgram.id, 1)

      // Apply weight updates to new week's exercises
      await applyWeightUpdates(newWorkouts, weightUpdates)
    }
  } else {
    // Advance to next week within program
    await programsApi.updateProgram(supabase, programId, { current_week: toWeek })

    // Initialize workouts for next week
    newWorkouts = await initializeWeekWorkouts(programId, toWeek)

    // Apply weight updates to new week's exercises
    const exercisesWithWeightIncrease = await applyWeightUpdates(newWorkouts, weightUpdates)

    // Award level progress
    for (let i = 0; i < exercisesWithWeightIncrease; i++) {
      const result = await awardLevelProgress(supabase, user.id)
      if (result.leveledUp) {
        leveledUp = true
        newLevel = result.newLevel
      }
    }
  }

  revalidatePath('/')
  return {
    workouts: newWorkouts,
    leveledUp,
    newLevel,
    programComplete,
    nextProgramId,
    nextProgramName
  }
}

// Helper to apply weight updates to workouts
async function applyWeightUpdates(
  workouts: Workout[],
  weightUpdates: Record<string, number>
): Promise<number> {
  if (Object.keys(weightUpdates).length === 0) return 0

  const supabase = await createClient()
  const exercisesWithWeightIncrease = new Set<string>()

  for (const workout of workouts) {
    const { data: exercises } = await supabase
      .from('exercises')
      .select('id, name')
      .eq('workout_id', workout.id)

    if (exercises) {
      for (const exercise of exercises) {
        const newWeight = weightUpdates[exercise.name]
        if (newWeight !== undefined) {
          await supabase
            .from('exercises')
            .update({ weight_kg: newWeight })
            .eq('id', exercise.id)
          exercisesWithWeightIncrease.add(exercise.name)
        }
      }
    }
  }

  return exercisesWithWeightIncrease.size
}
