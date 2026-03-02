'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Confetti } from '@/components/ui/Confetti'
import { completeWorkout } from '@/app/actions/workout-actions'

const CONFETTI_MESSAGES = [
  "Excellent work!",
  "Crushing it!",
  "Beast mode!",
  "Consistency wins!",
  "Another one down!",
]

interface WorkoutCompleteViewProps {
  workoutId: string
  dayNumber: number
  weekNumber: number
  isSkipped?: boolean
}

export function WorkoutCompleteView({ workoutId, dayNumber, weekNumber, isSkipped }: WorkoutCompleteViewProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [message] = useState(() =>
    CONFETTI_MESSAGES[Math.floor(Math.random() * CONFETTI_MESSAGES.length)]
  )

  useEffect(() => {
    if (!isSkipped) {
      // Mark workout as complete when this page loads
      completeWorkout(workoutId)
      // Trigger confetti after a brief delay
      const timer = setTimeout(() => setShowConfetti(true), 100)
      return () => clearTimeout(timer)
    }
  }, [workoutId, isSkipped])

  const handleContinue = async () => {
    setIsLoading(true)
    router.push('/')
    router.refresh()
  }

  if (isSkipped) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {/* Skip icon */}
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-white mb-2">Day Skipped</h1>
          <p className="text-gray-400 mb-8">
            Day {dayNumber} of Week {weekNumber} skipped
          </p>

          {/* Stats */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
            <p className="text-sm text-gray-500">Rest up and come back stronger</p>
            <p className="text-2xl font-bold text-white mt-1">
              {dayNumber < 3 ? `${3 - dayNumber} day${3 - dayNumber > 1 ? 's' : ''} left this week` : 'Week complete!'}
            </p>
          </div>

          {/* Continue button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleContinue}
            loading={isLoading}
          >
            Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Confetti trigger={showConfetti} />
      <div className="text-center max-w-md">
        {/* Success icon */}
        <div className="w-24 h-24 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-2">{message}</h1>
        <p className="text-gray-400 mb-8">
          Day {dayNumber} of Week {weekNumber} complete
        </p>

        {/* Stats could go here */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
          <p className="text-sm text-gray-500">Workout completed</p>
          <p className="text-2xl font-bold text-white mt-1">
            {dayNumber < 3 ? `${3 - dayNumber} day${3 - dayNumber > 1 ? 's' : ''} left this week` : 'Week complete!'}
          </p>
        </div>

        {/* Continue button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleContinue}
          loading={isLoading}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
