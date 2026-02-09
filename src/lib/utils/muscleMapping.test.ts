import { describe, it, expect } from 'vitest'
import { getMuscleGroups, getIndividualMuscles, ALL_MUSCLE_GROUPS, type MuscleGroup } from './muscleMapping'

describe('getMuscleGroups', () => {
  describe('direct matches', () => {
    it('returns chest for bench press', () => {
      const result = getMuscleGroups('bench press')
      expect(result.primary).toBe('Chest')
    })

    it('returns back for bent over row', () => {
      const result = getMuscleGroups('bent over row')
      expect(result.primary).toBe('Back')
    })

    it('returns legs for squat', () => {
      const result = getMuscleGroups('squat')
      expect(result.primary).toBe('Legs')
    })

    it('returns shoulders for overhead press', () => {
      const result = getMuscleGroups('overhead press')
      expect(result.primary).toBe('Shoulders')
    })

    it('returns arms for bicep curl', () => {
      const result = getMuscleGroups('bicep curl')
      expect(result.primary).toBe('Arms')
    })
  })

  describe('case insensitive matching', () => {
    it('matches uppercase input', () => {
      const result = getMuscleGroups('BENCH PRESS')
      expect(result.primary).toBe('Chest')
    })

    it('matches mixed case input', () => {
      const result = getMuscleGroups('BeNcH PrEsS')
      expect(result.primary).toBe('Chest')
    })

    it('trims whitespace', () => {
      const result = getMuscleGroups('  bench press  ')
      expect(result.primary).toBe('Chest')
    })
  })

  describe('keyword fallback matching', () => {
    it('detects squat variations', () => {
      expect(getMuscleGroups('front squat').primary).toBe('Legs')
      expect(getMuscleGroups('back squat').primary).toBe('Legs')
      expect(getMuscleGroups('goblet squat').primary).toBe('Legs')
    })

    it('detects leg exercises', () => {
      expect(getMuscleGroups('leg press').primary).toBe('Legs')
      expect(getMuscleGroups('leg extension').primary).toBe('Legs')
    })

    it('detects lunge variations', () => {
      expect(getMuscleGroups('walking lunge').primary).toBe('Legs')
      expect(getMuscleGroups('reverse lunge').primary).toBe('Legs')
    })

    it('detects row variations', () => {
      expect(getMuscleGroups('cable row').primary).toBe('Back')
      expect(getMuscleGroups('t-bar row').primary).toBe('Back')
    })

    it('detects pull variations', () => {
      expect(getMuscleGroups('pull up').primary).toBe('Back')
      expect(getMuscleGroups('lat pulldown').primary).toBe('Back')
    })

    it('detects press exercises as chest', () => {
      expect(getMuscleGroups('incline press').primary).toBe('Chest')
      expect(getMuscleGroups('decline press').primary).toBe('Chest')
    })

    it('detects bench exercises as chest', () => {
      expect(getMuscleGroups('incline bench').primary).toBe('Chest')
      expect(getMuscleGroups('dumbbell bench').primary).toBe('Chest')
    })

    it('detects shoulder exercises', () => {
      expect(getMuscleGroups('lateral raise').primary).toBe('Shoulders')
      expect(getMuscleGroups('front raise').primary).toBe('Shoulders')
    })

    it('detects delt exercises', () => {
      expect(getMuscleGroups('rear delt fly').primary).toBe('Shoulders')
    })

    it('detects curl exercises as arms', () => {
      expect(getMuscleGroups('hammer curl').primary).toBe('Arms')
      expect(getMuscleGroups('preacher curl').primary).toBe('Arms')
    })

    it('detects tricep exercises', () => {
      expect(getMuscleGroups('tricep extension').primary).toBe('Arms')
      expect(getMuscleGroups('tricep pushdown').primary).toBe('Arms')
    })

    it('detects bicep exercises', () => {
      expect(getMuscleGroups('bicep curl').primary).toBe('Arms')
    })

    it('detects ab exercises', () => {
      expect(getMuscleGroups('ab crunch').primary).toBe('Core')
    })

    it('detects core exercises', () => {
      expect(getMuscleGroups('core plank').primary).toBe('Core')
    })

    it('detects crunch exercises', () => {
      expect(getMuscleGroups('reverse crunch').primary).toBe('Core')
    })
  })

  describe('default fallback', () => {
    it('defaults to Back for unknown exercises', () => {
      const result = getMuscleGroups('unknown exercise')
      expect(result.primary).toBe('Back')
    })
  })

  describe('secondary muscles', () => {
    it('returns secondary muscle when present', () => {
      const result = getMuscleGroups('deadlift')
      expect(result.secondary).toBeDefined()
    })
  })
})

describe('getIndividualMuscles', () => {
  describe('exact matches', () => {
    it('returns individual muscles for bench press', () => {
      const result = getIndividualMuscles('bench press')
      expect(result).not.toBeNull()
      expect(result!.muscles).toHaveLength(3)
      expect(result!.muscles[0].muscle).toBe('Pectorals')
    })

    it('returns individual muscles for squat', () => {
      const result = getIndividualMuscles('squat')
      expect(result).not.toBeNull()
      expect(result!.muscles[0].muscle).toBe('Quadriceps')
    })

    it('returns individual muscles for deadlift', () => {
      const result = getIndividualMuscles('deadlift')
      expect(result).not.toBeNull()
      expect(result!.muscles).toHaveLength(4)
    })
  })

  describe('case insensitive matching', () => {
    it('matches uppercase input', () => {
      const result = getIndividualMuscles('BENCH PRESS')
      expect(result).not.toBeNull()
      expect(result!.muscles[0].muscle).toBe('Pectorals')
    })

    it('trims whitespace', () => {
      const result = getIndividualMuscles('  bench press  ')
      expect(result).not.toBeNull()
      expect(result!.muscles[0].muscle).toBe('Pectorals')
    })
  })

  describe('partial matching', () => {
    it('matches partial exercise names', () => {
      const result = getIndividualMuscles('incline bench press')
      expect(result).not.toBeNull()
    })
  })

  describe('not found', () => {
    it('returns null for unknown exercises', () => {
      const result = getIndividualMuscles('completely unknown exercise')
      expect(result).toBeNull()
    })
  })

  describe('activation percentages', () => {
    it('returns activation values that sum to 100', () => {
      const result = getIndividualMuscles('bench press')
      expect(result).not.toBeNull()
      const totalActivation = result!.muscles.reduce((sum, m) => sum + m.activation, 0)
      expect(totalActivation).toBe(100)
    })
  })
})

describe('ALL_MUSCLE_GROUPS', () => {
  it('contains all muscle groups', () => {
    const expected: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']
    expect(ALL_MUSCLE_GROUPS).toEqual(expected)
  })
})
