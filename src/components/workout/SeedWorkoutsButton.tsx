'use client'

import { useState } from 'react'
import { seedDefaultWorkouts } from '@/app/actions/workout-actions'

export function SeedWorkoutsButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await seedDefaultWorkouts()
    } catch (error) {
      console.error('Failed to create workouts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Creating...' : 'Create Week 1 Workouts'}
    </button>
  )
}
