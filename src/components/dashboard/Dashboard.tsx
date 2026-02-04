'use client'

import { useState, useCallback } from 'react'
import { TimeFilter } from './TimeFilter'
import { StatCard, LevelCard } from './StatCard'
import { ExercisePerformance } from './ExercisePerformance'
import { MuscleBalance } from './MuscleBalance'
import { ExerciseVolumeBreakdown } from './ExerciseVolumeBreakdown'
import { DashboardStats, TimeFilter as TimeFilterType } from '@/lib/utils/statsCalculations'
import { getLevelTitle } from '@/lib/utils/levelProgress'

interface DashboardProps {
  initialStats: DashboardStats
  fetchStats: (filter: TimeFilterType) => Promise<DashboardStats>
}

export function Dashboard({ initialStats, fetchStats }: DashboardProps) {
  const [filter, setFilter] = useState<TimeFilterType>('all-time')
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [isLoading, setIsLoading] = useState(false)

  const handleFilterChange = useCallback(async (newFilter: TimeFilterType) => {
    setFilter(newFilter)
    setIsLoading(true)
    try {
      const newStats = await fetchStats(newFilter)
      setStats(newStats)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchStats])

  return (
    <div className={`space-y-4 ${isLoading ? 'opacity-70' : ''}`}>
      {/* Time Filter */}
      <TimeFilter value={filter} onChange={handleFilterChange} />

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Workouts"
          value={stats.totalWorkouts}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <LevelCard
          level={stats.currentLevel}
          progress={stats.levelProgress}
          title={getLevelTitle(stats.currentLevel)}
        />
        <StatCard
          label="Avg/Week"
          value={stats.avgWorkoutsPerWeek}
          subValue="workouts"
        />
        <StatCard
          label="Consistency"
          value={`${stats.consistencyPercentage}%`}
          subValue={stats.weeklyStreak > 0 ? `${stats.weeklyStreak} week streak` : undefined}
          progress={stats.consistencyPercentage}
        />
      </div>

      {/* Exercise Volume Breakdown */}
      <ExerciseVolumeBreakdown data={stats.exerciseVolumes} />

      {/* Exercise Performance */}
      <ExercisePerformance
        advancing={stats.advancingExercises}
        stagnating={stats.stagnatingExercises}
      />

      {/* Muscle Balance */}
      <MuscleBalance data={stats.individualMuscleVolumes} />
    </div>
  )
}
