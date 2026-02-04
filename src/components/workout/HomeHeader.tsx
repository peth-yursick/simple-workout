'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LevelProgressBar } from '@/components/ui/ProgressBar'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

interface HomeHeaderProps {
  username: string
  programName?: string
  currentWeek: number
  totalWeeks?: number
  level: number
  progress: number
  title: string
}

export function HomeHeader({ username, programName, currentWeek, totalWeeks, level, progress, title }: HomeHeaderProps) {
  const [editMode, setEditMode] = useState(false)

  // Persist edit mode to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('editMode')
    if (saved === 'true') {
      setEditMode(true)
    }
  }, [])

  const toggleEditMode = () => {
    const newValue = !editMode
    setEditMode(newValue)
    localStorage.setItem('editMode', String(newValue))
    // Dispatch custom event for same-tab listeners
    window.dispatchEvent(new Event('editModeChanged'))
  }

  return (
    <>
      {/* Header */}
      <header className="mb-8 text-center">
        <p className="text-gray-400 mb-2">Welcome, {username}!</p>
        {programName ? (
          <>
            <h1 className="text-3xl font-bold text-white">{programName}</h1>
            <p className="text-gray-400 mt-1">
              Week {currentWeek}{totalWeeks ? ` of ${totalWeeks}` : ''}
            </p>
          </>
        ) : (
          <h1 className="text-4xl font-bold text-white">Week {currentWeek}</h1>
        )}
      </header>

      {/* Edit mode toggle, notifications & settings */}
      <div className="flex justify-end gap-2 mb-3">
        <Link href="/settings" className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors bg-gray-800 hover:bg-gray-700" title="Settings">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
        <NotificationCenter />
        <button
          onClick={toggleEditMode}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            editMode
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
          title={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        >
          <svg className={`w-5 h-5 ${editMode ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Level Progress - clickable to stats */}
      <Link href="/stats" className="block mb-6">
        <div className="hover:scale-[1.02] transition-transform">
          <LevelProgressBar
            level={level}
            progress={progress}
            title={title}
          />
        </div>
      </Link>
    </>
  )
}
