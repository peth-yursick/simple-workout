'use client'

import { useState, useRef, useEffect } from 'react'

interface DayNameEditorProps {
  dayName: string | null
  dayNumber: number
  onSave: (name: string) => void
  disabled?: boolean
}

export function DayNameEditor({ dayName, dayNumber, onSave, disabled = false }: DayNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(dayName || '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const trimmed = value.trim()
    if (trimmed) {
      onSave(trimmed)
    } else {
      setValue(dayName || '') // Reset if empty
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setValue(dayName || '')
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="px-2 py-1 bg-gray-800 border border-blue-500 rounded text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={`Day ${dayNumber}`}
      />
    )
  }

  return (
    <button
      onClick={() => !disabled && setIsEditing(true)}
      disabled={disabled}
      className={`
        px-2 py-1 rounded text-sm font-medium transition-colors
        ${dayName
          ? 'text-white hover:bg-gray-800'
          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={dayName || `Click to name Day ${dayNumber}`}
    >
      {dayName || `Day ${dayNumber}`}
    </button>
  )
}
