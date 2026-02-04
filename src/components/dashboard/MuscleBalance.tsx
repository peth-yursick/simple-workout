import { IndividualMuscleVolume } from '@/lib/utils/statsCalculations'

interface MuscleBalanceProps {
  data: IndividualMuscleVolume[]
}

export function MuscleBalance({ data }: MuscleBalanceProps) {
  // Calculate average percentage
  const avgPercentage = data.reduce((sum, d) => sum + d.percentage, 0) / data.length

  const getBarColor = (percentage: number) => {
    if (percentage >= avgPercentage * 1.2) return 'bg-green-500' // Above average
    if (percentage >= avgPercentage * 0.8) return 'bg-yellow-500' // Average
    return 'bg-red-500' // Below average
  }

  const getTextColor = (percentage: number) => {
    if (percentage >= avgPercentage * 1.2) return 'text-green-400'
    if (percentage >= avgPercentage * 0.8) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Format volume for display
  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`
    if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`
    return vol.toString()
  }

  // Show top 12 muscles
  const topMuscles = data.slice(0, 12)

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Muscle Balance</h3>

      <div className="space-y-3">
        {topMuscles.map((item) => (
          <div key={item.muscle}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white">{item.muscle}</span>
                {item.isPrimary && (
                  <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded">Primary</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{formatVolume(item.volume)} kg</span>
                <span className={`text-xs ${getTextColor(item.percentage)}`}>
                  {item.percentage}%
                </span>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(item.percentage)}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="text-gray-500">Primary target</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-gray-500">Strong</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          <span className="text-gray-500">Balanced</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-gray-500">Needs work</span>
        </div>
      </div>
    </div>
  )
}
