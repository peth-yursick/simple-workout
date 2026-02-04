'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { getCoachAthletes, inviteAthlete } from '@/lib/api/coach'
import { createClient } from '@/lib/supabase/client'

interface Athlete {
  athlete_id: string
  status: string
  athlete: {
    email: string
    current_level: number
  }[]
}

interface CoachDashboardProps {
  coachId: string
  initialAthletes: Athlete[]
}

export function CoachDashboard({ coachId, initialAthletes }: CoachDashboardProps) {
  const router = useRouter()
  const [athletes, setAthletes] = useState(initialAthletes)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeAthletes = athletes.filter(a => a.status === 'active')
  const pendingAthletes = athletes.filter(a => a.status === 'pending')

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    setError(null)

    try {
      const supabase = createClient()
      await inviteAthlete(supabase, coachId, inviteEmail.trim())

      // Refresh athletes list
      const updated = await getCoachAthletes(supabase, coachId)
      setAthletes(updated)

      setInviteEmail('')
      setShowInviteModal(false)
    } catch (err) {
      console.error('Failed to invite athlete:', err)
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <>
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm">Active Athletes</p>
          <p className="text-3xl font-bold text-white mt-1">{activeAthletes.length}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm">Pending Invitations</p>
          <p className="text-3xl font-bold text-white mt-1">{pendingAthletes.length}</p>
        </div>
      </div>

      {/* Invite button */}
      <div className="mb-6 flex justify-end">
        <Button
          variant="primary"
          onClick={() => setShowInviteModal(true)}
        >
          + Invite Athlete
        </Button>
      </div>

      {/* Active Athletes */}
      {activeAthletes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Active Athletes</h2>
          <div className="space-y-3">
            {activeAthletes.map((athlete) => (
              <AthleteCard
                key={athlete.athlete_id}
                athlete={athlete}
                onClick={() => router.push(`/coach/athlete/${athlete.athlete_id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Athletes */}
      {pendingAthletes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Pending Invitations</h2>
          <div className="space-y-3">
            {pendingAthletes.map((athlete) => (
              <AthleteCard
                key={athlete.athlete_id}
                athlete={athlete}
                onClick={() => router.push(`/coach/athlete/${athlete.athlete_id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {athletes.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No athletes yet</h3>
          <p className="text-gray-400 mb-6">Invite athletes to start coaching them</p>
          <Button
            variant="primary"
            onClick={() => setShowInviteModal(true)}
          >
            + Invite Your First Athlete
          </Button>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-4">Invite Athlete</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Athlete Email or Username
              </label>
              <input
                type="text"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email or username"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                The athlete will receive a notification to accept your invitation.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowInviteModal(false)
                  setInviteEmail('')
                  setError(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleInvite}
                loading={isInviting}
                disabled={!inviteEmail.trim()}
              >
                Send Invite
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface AthleteCardProps {
  athlete: Athlete
  onClick: () => void
}

function AthleteCard({ athlete, onClick }: AthleteCardProps) {
  const statusColors = {
    active: 'bg-green-900/30 text-green-400',
    pending: 'bg-yellow-900/30 text-yellow-400',
    ended: 'bg-gray-700/30 text-gray-400',
  }

  const athleteData = athlete.athlete[0] // Get first (and should be only) athlete record

  return (
    <button
      onClick={onClick}
      className="w-full bg-gray-900 hover:bg-gray-800 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white font-medium">{athleteData?.email || 'Unknown'}</p>
          <p className="text-sm text-gray-400 mt-1">Level {athleteData?.current_level || 1}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[athlete.status as keyof typeof statusColors]}`}>
          {athlete.status}
        </span>
      </div>
    </button>
  )
}
