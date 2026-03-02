'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useConfetti } from '@/components/ui/Confetti'
import { WeightRecommendationExercise } from '@/lib/types/database'
import { calculateNewWeight } from '@/lib/utils/exerciseAnalysis'
import { startNextWeek } from '@/app/actions/workout-actions'
import { getLevelTitle } from '@/lib/utils/levelProgress'

interface WeekTransitionModalProps {
  weekNumber: number
  recommendations: WeightRecommendationExercise[]
}

export function WeekTransitionModal({ weekNumber, recommendations }: WeekTransitionModalProps) {
  const { fireworks } = useConfetti()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(
    new Set(recommendations.filter(r => r.recommendation === 'recommended').map(r => r.exercise_id))
  )
  const [levelUpInfo, setLevelUpInfo] = useState<{ leveledUp: boolean; newLevel: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fire confetti on mount - big celebration for completing the week!
  useEffect(() => {
    const timer = setTimeout(() => fireworks(), 200)
    return () => clearTimeout(timer)
  }, [fireworks])

  // Fire more confetti when leveling up!
  useEffect(() => {
    if (levelUpInfo?.leveledUp) {
      const timer = setTimeout(() => fireworks(), 300)
      return () => clearTimeout(timer)
    }
  }, [levelUpInfo, fireworks])

  const toggleExercise = (exerciseId: string) => {
    const newSelected = new Set(selectedExercises)
    if (newSelected.has(exerciseId)) {
      newSelected.delete(exerciseId)
    } else {
      newSelected.add(exerciseId)
    }
    setSelectedExercises(newSelected)
  }

  const handleStartNextWeek = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Create weight updates map for selected exercises
      const weightUpdates: Record<string, number> = {}
      for (const rec of recommendations) {
        if (selectedExercises.has(rec.exercise_id)) {
          weightUpdates[rec.exercise_name] = calculateNewWeight(rec.current_weight, rec.weight_direction || 'increase')
        }
      }

      console.log('Starting next week...', { weekNumber, weightUpdates })
      const result = await startNextWeek(weekNumber, weekNumber + 1, weightUpdates)
      console.log('Week started successfully:', result)

      // Check if user leveled up
      if (result.leveledUp) {
        setLevelUpInfo({ leveledUp: true, newLevel: result.newLevel })
      } else {
        // Use window.location for full page reload to ensure server components refresh
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Failed to start next week:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      })
      setError(errorMessage || 'Failed to start next week. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinueAfterLevelUp = () => {
    // Use window.location for full page reload to ensure server components refresh
    window.location.href = '/'
  }

  // Show level up congratulations screen
  if (levelUpInfo?.leveledUp) {
    return (
      <div className="fixed inset-0 bg-black/70 overflow-y-auto p-4 z-50">
        <div className="min-h-full flex items-center justify-center py-8">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-800">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/30">
                <span className="text-3xl font-bold text-white">{levelUpInfo.newLevel}</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Level Up!</h2>
              <p className="text-xl text-yellow-400 mb-2">{getLevelTitle(levelUpInfo.newLevel)}</p>
              <p className="text-gray-400 mb-8">
                You&apos;ve reached Level {levelUpInfo.newLevel}! Keep pushing those weights!
              </p>
              <Button
                variant="primary"
                className="w-full"
                size="lg"
                onClick={handleContinueAfterLevelUp}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 overflow-y-auto p-4 z-50">
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-800">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Week {weekNumber} Complete!</h2>
          <p className="text-gray-400 mt-2">Ready for Week {weekNumber + 1}?</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-200 text-sm font-medium">Error: {error}</p>
            <p className="text-red-300/70 text-xs mt-1">Please try again or contact support if the problem persists.</p>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 ? (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Weight adjustment suggestions:
            </h3>
            <div className="space-y-2">
              {recommendations.map((rec) => {
                const newWeight = calculateNewWeight(rec.current_weight, rec.weight_direction || 'increase')
                const isSelected = selectedExercises.has(rec.exercise_id)
                const isDecrease = rec.weight_direction === 'decrease'
                const isRecommended = rec.recommendation === 'recommended'

                return (
                  <button
                    key={rec.exercise_id}
                    onClick={() => toggleExercise(rec.exercise_id)}
                    className={`
                      w-full p-3 rounded-lg border-2 text-left transition-all
                      ${isSelected
                        ? 'border-blue-500 bg-blue-950/50'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{rec.exercise_name}</p>
                        <p className="text-sm text-gray-400">
                          {rec.current_weight}kg → {newWeight}kg
                          {isDecrease && <span className="text-xs text-blue-400 ml-1">(less assistance)</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`
                          text-xs px-2 py-1 rounded-full
                          ${isRecommended
                            ? 'bg-green-900/50 text-green-400'
                            : 'bg-yellow-900/50 text-yellow-400'
                          }
                        `}>
                          {isRecommended ? 'Recommended' : 'Consider'}
                        </span>
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center
                          ${isSelected
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-600'
                          }
                        `}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg text-center">
            <p className="text-gray-300">Continue with current weights</p>
            <p className="text-sm text-gray-500 mt-1">
              Keep pushing - weight increases will come!
            </p>
          </div>
        )}

        {/* Action button */}
        <Button
          variant="primary"
          className="w-full"
          size="lg"
          onClick={handleStartNextWeek}
          loading={isLoading}
        >
          Start Week {weekNumber + 1}
        </Button>
        </div>
      </div>
    </div>
  )
}
