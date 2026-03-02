'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { skipWorkout } from '@/app/actions/workout-actions'

interface SkipDayButtonProps {
  workoutId: string
}

export function SkipDayButton({ workoutId }: SkipDayButtonProps) {
  const router = useRouter()
  const [isSkipping, setIsSkipping] = useState(false)

  const handleSkip = async () => {
    setIsSkipping(true)
    try {
      await skipWorkout(workoutId)
      // Navigate to complete page to check if week is done
      router.push(`/workout/${workoutId}/complete`)
      router.refresh()
    } catch (error) {
      console.error('Failed to skip workout:', error)
    } finally {
      setIsSkipping(false)
    }
  }

  return (
    <button
      onClick={handleSkip}
      disabled={isSkipping}
      className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
    >
      {isSkipping ? 'Skipping...' : 'Skip Day'}
    </button>
  )
}
