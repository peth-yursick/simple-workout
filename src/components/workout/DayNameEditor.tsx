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
        className="w-full bg-transparent text-white text-xl font-bold focus:outline-none"
        placeholder={`Day ${dayNumber}`}
      />
    )
  }

  return (
    <button
      onClick={() => !disabled && setIsEditing(true)}
      disabled={disabled}
      className={`
        w-full text-left text-xl font-bold transition-colors
        ${dayName
          ? 'text-white'
          : 'text-gray-400'
        }
        ${!disabled && 'hover:text-white'}
        ${disabled ? 'cursor-default' : 'cursor-pointer'}
      `}
      title={dayName || `Day ${dayNumber}`}
    >
      {dayName || `Day ${dayNumber}`}
    </button>
  )
}
