'use client'

import { VolumeDataPoint } from '@/lib/utils/statsCalculations'

interface VolumeChartProps {
  data: VolumeDataPoint[]
}

export function VolumeChart({ data }: VolumeChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Total Volume Over Time</h3>
        <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
          No data yet
        </div>
      </div>
    )
  }

  const maxVolume = Math.max(...data.map(d => d.volume), 1)
  const minVolume = Math.min(...data.map(d => d.volume))
  const range = maxVolume - minVolume || 1

  // Calculate points for the line
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * 100
    const y = 100 - ((d.volume - minVolume) / range) * 80 - 10 // 10-90% range
    return { x, y, ...d }
  })

  // Create SVG path
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  // Create area path (for gradient fill)
  const areaD = `${pathD} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`

  // Format volume for display
  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`
    return vol.toString()
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Total Volume Over Time</h3>

      <div className="relative h-40">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>{formatVolume(maxVolume)}</span>
          <span>{formatVolume(minVolume)}</span>
        </div>

        {/* Chart area */}
        <div className="absolute left-12 right-0 top-0 bottom-6">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            {/* Gradient definition */}
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="rgb(55, 65, 81)" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgb(55, 65, 81)" strokeWidth="0.5" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="rgb(55, 65, 81)" strokeWidth="0.5" />

            {/* Area fill */}
            <path d={areaD} fill="url(#volumeGradient)" />

            {/* Line */}
            <path
              d={pathD}
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Data points as HTML elements (won't stretch) */}
          {points.map((p, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
              }}
            />
          ))}
        </div>

        {/* X-axis labels */}
        <div className="absolute left-12 right-0 bottom-0 flex justify-between text-xs text-gray-500">
          {data.length > 0 && <span>Week {data[0].weekNumber}</span>}
          {data.length > 1 && <span>Week {data[data.length - 1].weekNumber}</span>}
        </div>
      </div>

      {/* Trend indicator */}
      {data.length >= 2 && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {data[data.length - 1].volume > data[0].volume ? (
            <>
              <span className="text-green-400">Trending up</span>
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </>
          ) : data[data.length - 1].volume < data[0].volume ? (
            <>
              <span className="text-red-400">Trending down</span>
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
              </svg>
            </>
          ) : (
            <span className="text-gray-400">Stable</span>
          )}
        </div>
      )}
    </div>
  )
}
