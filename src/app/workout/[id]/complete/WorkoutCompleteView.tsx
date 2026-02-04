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
}

export function WorkoutCompleteView({ workoutId, dayNumber, weekNumber }: WorkoutCompleteViewProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [message] = useState(() =>
    CONFETTI_MESSAGES[Math.floor(Math.random() * CONFETTI_MESSAGES.length)]
  )

  useEffect(() => {
    // Mark workout as complete when this page loads
    completeWorkout(workoutId)
    // Trigger confetti after a brief delay
    const timer = setTimeout(() => setShowConfetti(true), 100)
    return () => clearTimeout(timer)
  }, [workoutId])

  const handleContinue = async () => {
    setIsLoading(true)
    router.push('/')
    router.refresh()
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
