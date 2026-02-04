interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  progress?: number // 0-100 for progress bar
  icon?: React.ReactNode
}

export function StatCard({ label, value, subValue, progress, icon }: StatCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}
      {progress !== undefined && (
        <div className="mt-3">
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface LevelCardProps {
  level: number
  progress: number
  title: string
}

export function LevelCard({ level, progress, title }: LevelCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide">Level</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-white">{level}</span>
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-400">{title}</div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
