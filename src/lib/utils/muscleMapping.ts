// Exercise to Muscle Group Mapping
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
