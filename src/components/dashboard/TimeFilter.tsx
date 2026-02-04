'use client'

import { TimeFilter as TimeFilterType } from '@/lib/utils/statsCalculations'

interface TimeFilterProps {
  value: TimeFilterType
  onChange: (value: TimeFilterType) => void
}

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  return (
    <div className="flex bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => onChange('all-time')}
        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          value === 'all-time'
            ? 'bg-gray-700 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        All-time
      </button>
      <button
        onClick={() => onChange('last-2-months')}
        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          value === 'last-2-months'
            ? 'bg-gray-700 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Last 2 months
      </button>
    </div>
  )
}
