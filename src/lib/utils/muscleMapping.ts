// Exercise to Muscle Group Mapping

// Individual muscle type for detailed tracking
export type IndividualMuscle =
  | 'Pectorals' | 'Anterior Deltoids' | 'Lateral Deltoids' | 'Posterior Deltoids' | 'Triceps'
  | 'Latissimus Dorsi' | 'Teres Major' | 'Rhomboids' | 'Middle Trapezius' | 'Lower Trapezius' | 'Biceps' | 'Brachialis' | 'Forearms'
  | 'Quadriceps' | 'Hamstrings' | 'Glutes' | 'Calves' | 'Adductors' | 'Abductors' | 'Hip Flexors'
  | 'Rectus Abdominis' | 'Obliques' | 'Erector Spinae'

interface IndividualMuscleMapping {
  muscles: Array<{ muscle: IndividualMuscle; activation: number }>
}

// Map exercise names to individual muscles (fallback when exercise_library is not linked)
const EXERCISE_INDIVIDUAL_MUSCLE_MAP: Record<string, IndividualMuscleMapping> = {
  // Chest exercises
  'bench press': { muscles: [{ muscle: 'Pectorals', activation: 70 }, { muscle: 'Anterior Deltoids', activation: 20 }, { muscle: 'Triceps', activation: 10 }] },
  'incline bench press': { muscles: [{ muscle: 'Pectorals', activation: 60 }, { muscle: 'Anterior Deltoids', activation: 30 }, { muscle: 'Triceps', activation: 10 }] },
  'dumbbell press': { muscles: [{ muscle: 'Pectorals', activation: 65 }, { muscle: 'Anterior Deltoids', activation: 25 }, { muscle: 'Triceps', activation: 10 }] },
  'dips': { muscles: [{ muscle: 'Pectorals', activation: 50 }, { muscle: 'Triceps', activation: 40 }, { muscle: 'Anterior Deltoids', activation: 10 }] },
  'chest fly': { muscles: [{ muscle: 'Pectorals', activation: 90 }, { muscle: 'Anterior Deltoids', activation: 10 }] },
  'cable fly': { muscles: [{ muscle: 'Pectorals', activation: 90 }, { muscle: 'Anterior Deltoids', activation: 10 }] },
  'push up': { muscles: [{ muscle: 'Pectorals', activation: 70 }, { muscle: 'Triceps', activation: 20 }, { muscle: 'Anterior Deltoids', activation: 10 }] },

  // Back exercises
  'wide grip row': { muscles: [{ muscle: 'Latissimus Dorsi', activation: 60 }, { muscle: 'Rhomboids', activation: 20 }, { muscle: 'Biceps', activation: 15 }, { muscle: 'Middle Trapezius', activation: 5 }] },
  'bent over row': { muscles: [{ muscle: 'Latissimus Dorsi', activation: 50 }, { muscle: 'Rhomboids', activation: 25 }, { muscle: 'Biceps', activation: 15 }, { muscle: 'Middle Trapezius', activation: 10 }] },
  'pendlay row': { muscles: [{ muscle: 'Latissimus Dorsi', activation: 55 }, { muscle: 'Rhomboids', activation: 25 }, { muscle: 'Middle Trapezius', activation: 15 }, { muscle: 'Biceps', activation: 5 }] },
  'lat pulldown': { muscles: [{ muscle: 'Latissimus Dorsi', activation: 75 }, { muscle: 'Biceps', activation: 15 }, { muscle: 'Brachialis', activation: 10 }] },
  'chin up': { muscles: [{ muscle: 'Latissimus Dorsi', activation: 60 }, { muscle: 'Biceps', activation: 30 }, { muscle: 'Brachialis', activation: 10 }] },
  'pull up': { muscles: [{ muscle: 'Latissimus Dorsi', activation: 70 }, { muscle: 'Biceps', activation: 20 }, { muscle: 'Brachialis', activation: 10 }] },
  'seated row': { muscles: [{ muscle: 'Middle Trapezius', activation: 40 }, { muscle: 'Latissimus Dorsi', activation: 30 }, { muscle: 'Rhomboids', activation: 20 }, { muscle: 'Biceps', activation: 10 }] },
  'cable row': { muscles: [{ muscle: 'Middle Trapezius', activation: 40 }, { muscle: 'Latissimus Dorsi', activation: 30 }, { muscle: 'Rhomboids', activation: 20 }, { muscle: 'Biceps', activation: 10 }] },
  'deadlift': { muscles: [{ muscle: 'Glutes', activation: 30 }, { muscle: 'Hamstrings', activation: 25 }, { muscle: 'Erector Spinae', activation: 25 }, { muscle: 'Quadriceps', activation: 20 }] },

  // Shoulder exercises
  'overhead press': { muscles: [{ muscle: 'Anterior Deltoids', activation: 60 }, { muscle: 'Lateral Deltoids', activation: 25 }, { muscle: 'Triceps', activation: 15 }] },
  'shoulder press': { muscles: [{ muscle: 'Anterior Deltoids', activation: 60 }, { muscle: 'Lateral Deltoids', activation: 25 }, { muscle: 'Triceps', activation: 15 }] },
  'military press': { muscles: [{ muscle: 'Anterior Deltoids', activation: 60 }, { muscle: 'Lateral Deltoids', activation: 25 }, { muscle: 'Triceps', activation: 15 }] },
  'lateral raise': { muscles: [{ muscle: 'Lateral Deltoids', activation: 80 }, { muscle: 'Anterior Deltoids', activation: 15 }, { muscle: 'Teres Major', activation: 5 }] },
  'db lateral raise': { muscles: [{ muscle: 'Lateral Deltoids', activation: 80 }, { muscle: 'Anterior Deltoids', activation: 15 }, { muscle: 'Teres Major', activation: 5 }] },
  'front raise': { muscles: [{ muscle: 'Anterior Deltoids', activation: 85 }, { muscle: 'Lateral Deltoids', activation: 15 }] },
  'rear delt fly': { muscles: [{ muscle: 'Posterior Deltoids', activation: 70 }, { muscle: 'Rhomboids', activation: 20 }, { muscle: 'Middle Trapezius', activation: 10 }] },
  'face pull': { muscles: [{ muscle: 'Posterior Deltoids', activation: 50 }, { muscle: 'Rhomboids', activation: 30 }, { muscle: 'Middle Trapezius', activation: 20 }] },
  'shrugs': { muscles: [{ muscle: 'Middle Trapezius', activation: 60 }, { muscle: 'Lower Trapezius', activation: 40 }] },

  // Arm exercises
  'bicep curl': { muscles: [{ muscle: 'Biceps', activation: 80 }, { muscle: 'Brachialis', activation: 20 }] },
  'curl': { muscles: [{ muscle: 'Biceps', activation: 80 }, { muscle: 'Brachialis', activation: 20 }] },
  'hammer curl': { muscles: [{ muscle: 'Brachialis', activation: 60 }, { muscle: 'Biceps', activation: 40 }] },
  'preacher curl': { muscles: [{ muscle: 'Biceps', activation: 85 }, { muscle: 'Brachialis', activation: 15 }] },
  'concentration curl': { muscles: [{ muscle: 'Biceps', activation: 90 }, { muscle: 'Brachialis', activation: 10 }] },
  'tricep extension': { muscles: [{ muscle: 'Triceps', activation: 90 }, { muscle: 'Anterior Deltoids', activation: 10 }] },
  'tricep pushdown': { muscles: [{ muscle: 'Triceps', activation: 90 }, { muscle: 'Anterior Deltoids', activation: 10 }] },
  'skull crusher': { muscles: [{ muscle: 'Triceps', activation: 85 }, { muscle: 'Anterior Deltoids', activation: 15 }] },

  // Leg exercises
  'squat': { muscles: [{ muscle: 'Quadriceps', activation: 60 }, { muscle: 'Glutes', activation: 25 }, { muscle: 'Erector Spinae', activation: 15 }] },
  'back squat': { muscles: [{ muscle: 'Quadriceps', activation: 60 }, { muscle: 'Glutes', activation: 25 }, { muscle: 'Erector Spinae', activation: 15 }] },
  'leg press': { muscles: [{ muscle: 'Quadriceps', activation: 70 }, { muscle: 'Glutes', activation: 30 }] },
  'leg extension': { muscles: [{ muscle: 'Quadriceps', activation: 95 }, { muscle: 'Glutes', activation: 5 }] },
  'leg curl': { muscles: [{ muscle: 'Hamstrings', activation: 90 }, { muscle: 'Glutes', activation: 10 }] },
  'lunges': { muscles: [{ muscle: 'Quadriceps', activation: 50 }, { muscle: 'Glutes', activation: 30 }, { muscle: 'Hamstrings', activation: 20 }] },
  'romanian deadlift': { muscles: [{ muscle: 'Hamstrings', activation: 60 }, { muscle: 'Glutes', activation: 30 }, { muscle: 'Erector Spinae', activation: 10 }] },
  'stiff leg deadlift': { muscles: [{ muscle: 'Hamstrings', activation: 60 }, { muscle: 'Glutes', activation: 30 }, { muscle: 'Erector Spinae', activation: 10 }] },
  'hip thrust': { muscles: [{ muscle: 'Glutes', activation: 80 }, { muscle: 'Hamstrings', activation: 20 }] },
  'calf raise': { muscles: [{ muscle: 'Calves', activation: 100 }] },

  // Core exercises
  'plank': { muscles: [{ muscle: 'Rectus Abdominis', activation: 50 }, { muscle: 'Obliques', activation: 30 }, { muscle: 'Erector Spinae', activation: 20 }] },
  'crunch': { muscles: [{ muscle: 'Rectus Abdominis', activation: 80 }, { muscle: 'Obliques', activation: 20 }] },
  'sit up': { muscles: [{ muscle: 'Rectus Abdominis', activation: 70 }, { muscle: 'Hip Flexors', activation: 30 }] },
  'leg raise': { muscles: [{ muscle: 'Rectus Abdominis', activation: 70 }, { muscle: 'Hip Flexors', activation: 30 }] },
  'russian twist': { muscles: [{ muscle: 'Obliques', activation: 80 }, { muscle: 'Rectus Abdominis', activation: 20 }] },
  'ab wheel': { muscles: [{ muscle: 'Rectus Abdominis', activation: 60 }, { muscle: 'Obliques', activation: 20 }, { muscle: 'Erector Spinae', activation: 20 }] },
  'cable crunch': { muscles: [{ muscle: 'Rectus Abdominis', activation: 85 }, { muscle: 'Obliques', activation: 15 }] },
}

/**
 * Get individual muscles for an exercise name (fallback when exercise_library is not available)
 */
export function getIndividualMuscles(exerciseName: string): IndividualMuscleMapping | null {
  const normalizedName = exerciseName.toLowerCase().trim()

  // Direct match
  if (EXERCISE_INDIVIDUAL_MUSCLE_MAP[normalizedName]) {
    return EXERCISE_INDIVIDUAL_MUSCLE_MAP[normalizedName]
  }

  // Partial match - find if exercise name contains any key
  for (const [key, mapping] of Object.entries(EXERCISE_INDIVIDUAL_MUSCLE_MAP)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return mapping
    }
  }

  return null
}

export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core'

interface MuscleMapping {
  primary: MuscleGroup
  secondary?: MuscleGroup
}

// Map exercise names to muscle groups (case-insensitive matching)
const EXERCISE_MUSCLE_MAP: Record<string, MuscleMapping> = {
  // Legs
  'stiff leg deadlift': { primary: 'Legs', secondary: 'Back' },
  'leg press': { primary: 'Legs' },
  'back squat': { primary: 'Legs' },
  'squat': { primary: 'Legs' },
  'leg extension': { primary: 'Legs' },
  'leg curl': { primary: 'Legs' },
  'lunges': { primary: 'Legs' },
  'calf raise': { primary: 'Legs' },
  'romanian deadlift': { primary: 'Legs', secondary: 'Back' },
  'hip thrust': { primary: 'Legs' },

  // Back
  'wide grip row': { primary: 'Back' },
  'pendlay row': { primary: 'Back' },
  'bent over row': { primary: 'Back' },
  'lat pulldown': { primary: 'Back', secondary: 'Arms' },
  'chin up': { primary: 'Back', secondary: 'Arms' },
  'pull up': { primary: 'Back', secondary: 'Arms' },
  'seated row': { primary: 'Back' },
  'cable row': { primary: 'Back' },
  't-bar row': { primary: 'Back' },
  'deadlift': { primary: 'Back', secondary: 'Legs' },

  // Chest
  'bench press': { primary: 'Chest', secondary: 'Arms' },
  'incline press': { primary: 'Chest' },
  'incline bench press': { primary: 'Chest' },
  'dips': { primary: 'Chest', secondary: 'Arms' },
  'chest fly': { primary: 'Chest' },
  'cable fly': { primary: 'Chest' },
  'push up': { primary: 'Chest', secondary: 'Arms' },
  'dumbbell press': { primary: 'Chest' },
  'decline press': { primary: 'Chest' },

  // Shoulders
  'face pulls': { primary: 'Shoulders', secondary: 'Back' },
  'face pull': { primary: 'Shoulders', secondary: 'Back' },
  'shrugs': { primary: 'Shoulders' },
  'db lateral raise': { primary: 'Shoulders' },
  'lateral raise': { primary: 'Shoulders' },
  'overhead press': { primary: 'Shoulders' },
  'shoulder press': { primary: 'Shoulders' },
  'military press': { primary: 'Shoulders' },
  'front raise': { primary: 'Shoulders' },
  'rear delt fly': { primary: 'Shoulders' },
  'upright row': { primary: 'Shoulders' },

  // Arms
  'bicep curl': { primary: 'Arms' },
  'curl': { primary: 'Arms' },
  'hammer curl': { primary: 'Arms' },
  'tricep extension': { primary: 'Arms' },
  'tricep pushdown': { primary: 'Arms' },
  'skull crusher': { primary: 'Arms' },
  'preacher curl': { primary: 'Arms' },
  'concentration curl': { primary: 'Arms' },

  // Core
  'plank': { primary: 'Core' },
  'crunch': { primary: 'Core' },
  'sit up': { primary: 'Core' },
  'leg raise': { primary: 'Core' },
  'russian twist': { primary: 'Core' },
  'ab wheel': { primary: 'Core' },
  'cable crunch': { primary: 'Core' },
}

/**
 * Get muscle groups for an exercise name
 * Uses fuzzy matching to find the best match
 */
export function getMuscleGroups(exerciseName: string): MuscleMapping {
  const normalizedName = exerciseName.toLowerCase().trim()

  // Direct match
  if (EXERCISE_MUSCLE_MAP[normalizedName]) {
    return EXERCISE_MUSCLE_MAP[normalizedName]
  }

  // Partial match - find if exercise name contains any key
  for (const [key, mapping] of Object.entries(EXERCISE_MUSCLE_MAP)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return mapping
    }
  }

  // Check for common keywords
  if (normalizedName.includes('squat') || normalizedName.includes('leg') || normalizedName.includes('lunge')) {
    return { primary: 'Legs' }
  }
  if (normalizedName.includes('row') || normalizedName.includes('pull') || normalizedName.includes('lat')) {
    return { primary: 'Back' }
  }
  if (normalizedName.includes('press') || normalizedName.includes('bench') || normalizedName.includes('chest')) {
    return { primary: 'Chest' }
  }
  if (normalizedName.includes('shoulder') || normalizedName.includes('delt') || normalizedName.includes('raise')) {
    return { primary: 'Shoulders' }
  }
  if (normalizedName.includes('curl') || normalizedName.includes('tricep') || normalizedName.includes('bicep')) {
    return { primary: 'Arms' }
  }
  if (normalizedName.includes('ab') || normalizedName.includes('core') || normalizedName.includes('crunch')) {
    return { primary: 'Core' }
  }

  // Default to Back if unknown (most compound movements involve back)
  return { primary: 'Back' }
}

export const ALL_MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']
