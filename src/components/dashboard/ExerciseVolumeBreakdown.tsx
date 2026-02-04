'use client'

import { useState } from 'react'
import { ExerciseVolume } from '@/lib/utils/statsCalculations'

interface ExerciseVolumeBreakdownProps {
  data: ExerciseVolume[]
}

export function ExerciseVolumeBreakdown({ data }: ExerciseVolumeBreakdownProps) {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null)

  if (data.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Exercise Volume</h3>
        <div className="h-20 flex items-center justify-center text-gray-500 text-sm">
          No exercise data yet
        </div>
      </div>
    )
  }

  const maxVolume = Math.max(...data.map(d => d.totalVolume), 1)
  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M kg`
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K kg`
    return `${vol} kg`
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Exercise Volume Breakdown</h3>

      <div className="space-y-2">
        {data.slice(0, 10).map((exercise) => {
          const isExpanded = expandedExercise === exercise.name
          const percentage = (exercise.totalVolume / maxVolume) * 100

          return (
            <div key={exercise.name} className="border-b border-gray-800 last:border-0">
              {/* Exercise row */}
              <button
                onClick={() => setExpandedExercise(isExpanded ? null : exercise.name)}
                className="w-full py-2 flex items-center justify-between hover:bg-gray-800/50 rounded px-2 -mx-2 transition-colors"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-medium">{exercise.name}</span>
                    <span className="text-sm text-gray-400">{formatVolume(exercise.totalVolume)}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Weekly progression (when expanded) */}
              {isExpanded && exercise.weeklyProgression.length > 1 && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <div className="text-xs text-gray-400 mb-2">Weekly Progression</div>
                  <MiniVolumeChart data={exercise.weeklyProgression} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface MiniVolumeChartProps {
  data: { weekNumber: number; volume: number }[]
}

function MiniVolumeChart({ data }: MiniVolumeChartProps) {
  if (data.length < 2) {
    return <div className="text-xs text-gray-500">Need more data</div>
  }

  const maxVolume = Math.max(...data.map(d => d.volume), 1)
  const minVolume = Math.min(...data.map(d => d.volume))
  const range = maxVolume - minVolume || 1

  // Calculate relative positions
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((d.volume - minVolume) / range) * 80 - 10
    return { x, y, volume: d.volume, week: d.weekNumber }
  })

  // Create SVG path
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // Get trend
  const firstVol = data[0].volume
  const lastVol = data[data.length - 1].volume
  const trend = lastVol > firstVol ? 'up' : lastVol < firstVol ? 'down' : 'stable'

  return (
    <div className="relative h-20">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="rgb(55, 65, 81)" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="rgb(55, 65, 81)" strokeWidth="0.5" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="rgb(55, 65, 81)" strokeWidth="0.5" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={trend === 'up' ? 'rgb(34, 197, 94)' : trend === 'down' ? 'rgb(239, 68, 68)' : 'rgb(156, 163, 175)'}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Data points */}
      {points.map((p, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: trend === 'up' ? 'rgb(34, 197, 94)' : trend === 'down' ? 'rgb(239, 68, 68)' : 'rgb(156, 163, 175)',
          }}
          title={`Week ${p.week}: ${p.volume} kg`}
        />
      ))}

      {/* Trend indicator */}
      <div className="absolute bottom-0 right-0 text-xs">
        {trend === 'up' && <span className="text-green-400">↗ Trending up</span>}
        {trend === 'down' && <span className="text-red-400">↘ Trending down</span>}
        {trend === 'stable' && <span className="text-gray-400">→ Stable</span>}
      </div>
    </div>
  )
}
