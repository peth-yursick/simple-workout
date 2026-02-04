'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { getAthleteCoach, getPendingInvitations, acceptCoachInvitation, rejectCoachInvitation, generateInvitationCode, lookupInvitationCode } from '@/lib/api/coach'
import { createClient } from '@/lib/supabase/client'

export function Settings({ userId }: { userId: string }) {
  const [coach, setCoach] = useState<{ email: string } | null>(null)
  const [pendingInvites, setPendingInvites] = useState<Array<{ id: string; coach_id: string; coach: { email: string }[] }>>([])
  const [showInviteCoach, setShowInviteCoach] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [invitationCode, setInvitationCode] = useState<string | null>(null)
  const [showInviteCode, setShowInviteCode] = useState(false)
  const [inviteCodeInput, setInviteCodeInput] = useState('')
  const [isLookingUpCode, setIsLookingUpCode] = useState(false)

  const loadCoachData = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Load current coach
      const coachData = await getAthleteCoach(supabase, userId)
      if (coachData?.coach && coachData.coach.length > 0) {
        setCoach({ email: coachData.coach[0].email })
      }

      // Load pending invitations
      const invites = await getPendingInvitations(supabase, userId)
      setPendingInvites(invites)

      // Load or generate invitation code
      const { data: existingCode } = await supabase
        .from('invitation_codes')
        .select('code')
        .eq('athlete_id', userId)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (existingCode) {
        setInvitationCode(existingCode.code)
      }
    } catch (err) {
      console.error('Failed to load coach data:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadCoachData()
  }, [loadCoachData])

  const handleInviteCoach = async () => {
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    setError(null)

    try {
      // Note: This assumes the coach's email is their user id
      // In production, you'd want to look up the coach by email
      const supabase = createClient()

      // Create a pending invitation where the athlete is the coach and the "coach" is the athlete
      // This is a workaround - in production you'd have a proper invitation system
      await supabase.from('coach_athlete').insert({
        coach_id: inviteEmail.trim(), // The coach's user ID
        athlete_id: userId,
        status: 'pending',
        can_edit: false,
      })

      // Reload data
      await loadCoachData()
      setInviteEmail('')
      setShowInviteCoach(false)
    } catch (err) {
      console.error('Failed to invite coach:', err)
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  const handleAcceptInvite = async (inviteId: string, coachId: string) => {
    try {
      const supabase = createClient()
      await acceptCoachInvitation(supabase, coachId, userId)
      await loadCoachData()
    } catch (err) {
      console.error('Failed to accept invitation:', err)
      setError('Failed to accept invitation')
    }
  }

  const handleRejectInvite = async (inviteId: string, coachId: string) => {
    try {
      const supabase = createClient()
      await rejectCoachInvitation(supabase, coachId, userId)
      await loadCoachData()
    } catch (err) {
      console.error('Failed to reject invitation:', err)
      setError('Failed to reject invitation')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-6">
        <Link
          href="/"
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </header>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Coach Section */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Coach</h2>

        {coach ? (
          <div className="flex items-center justify-between p-4 bg-green-900/20 rounded-lg border border-green-900/50">
            <div>
              <p className="text-sm text-gray-400">Your Coach</p>
              <p className="text-white font-medium">{coach.email}</p>
            </div>
            <span className="text-xs px-3 py-1 bg-green-900/30 text-green-400 rounded-full">
              Active
            </span>
          </div>
        ) : pendingInvites.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">You have pending coach invitations:</p>
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-4 bg-yellow-900/20 rounded-lg border border-yellow-900/50"
              >
                <div>
                  <p className="text-sm text-gray-400">Coach Invitation</p>
                  <p className="text-white font-medium">{invite.coach?.[0]?.email || 'Unknown'}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAcceptInvite(invite.id, invite.coach_id)}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRejectInvite(invite.id, invite.coach_id)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No coach connected</p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="primary"
                onClick={() => setShowInviteCoach(true)}
              >
                + Add Coach
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowInviteCode(true)}
              >
                Invitation Code
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Enter your coach&apos;s username or generate an invitation code
            </p>
          </div>
        )}
      </div>

      {/* Invitation Code Section - always visible to generate/view code */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Invitation Code</h2>
        <p className="text-gray-400 text-sm mb-4">
          Generate a code to share with your coach
        </p>

        {invitationCode ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <code className="text-2xl font-mono text-white flex-1 text-center tracking-widest">
                {invitationCode}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(invitationCode)
                }}
              >
                Copy
              </Button>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={async () => {
                try {
                  const supabase = createClient()
                  const code = await generateInvitationCode(supabase, userId)
                  setInvitationCode(code)
                } catch (err) {
                  console.error('Failed to generate code:', err)
                }
              }}
            >
              Generate New Code
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            className="w-full"
            onClick={async () => {
              try {
                const supabase = createClient()
                const code = await generateInvitationCode(supabase, userId)
                setInvitationCode(code)
              } catch (err) {
                console.error('Failed to generate code:', err)
              }
            }}
          >
            Generate Invitation Code
          </Button>
        )}
      </div>

      {/* Coach Dashboard Link */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Coach Mode</h2>
        <p className="text-gray-400 text-sm mb-4">
          Are you a coach? Access your coach dashboard to manage athletes.
        </p>
        <Link href="/coach">
          <Button variant="secondary" className="w-full">
            Go to Coach Dashboard
          </Button>
        </Link>
      </div>

      {/* Invite Coach Modal */}
      {showInviteCoach && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-4">Add Coach</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Tab buttons */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setInviteCodeInput('')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  !inviteCodeInput
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-300'
                }`}
              >
                By Email
              </button>
              <button
                onClick={() => setInviteCodeInput(inviteCodeInput ? '' : ' ')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  inviteCodeInput
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-300'
                }`}
              >
                By Code
              </button>
            </div>

            {!inviteCodeInput ? (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Coach Username or Email
                  </label>
                  <input
                    type="text"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter your coach's username or email"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowInviteCoach(false)
                      setInviteEmail('')
                      setError(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleInviteCoach}
                    loading={isInviting}
                    disabled={!inviteEmail.trim()}
                  >
                    Send Invite
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Invitation Code
                  </label>
                  <input
                    type="text"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value)}
                    placeholder="Enter invitation code from your coach"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl tracking-widest uppercase"
                    maxLength={8}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowInviteCoach(false)
                      setInviteCodeInput('')
                      setError(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleLookupCode}
                    loading={isLookingUpCode}
                    disabled={inviteCodeInput.length !== 8}
                  >
                    Connect
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Show Invitation Code Modal */}
      {showInviteCode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-4">Your Invitation Code</h2>

            <p className="text-gray-400 text-sm mb-6">
              Share this code with your coach. They can enter it in their dashboard to connect with you.
            </p>

            {invitationCode ? (
              <>
                <div className="mb-6 p-6 bg-gray-800 rounded-lg border border-gray-700">
                  <code className="block text-4xl font-mono text-white text-center tracking-widest">
                    {invitationCode}
                  </code>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/invite/${invitationCode}`)
                    }}
                  >
                    Copy Link
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(invitationCode)
                    }}
                  >
                    Copy Code
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-400">Loading...</p>
            )}

            <Button
              variant="secondary"
              className="w-full mt-4"
              onClick={() => setShowInviteCode(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  async function handleLookupCode() {
    setIsLookingUpCode(true)
    setError(null)

    try {
      const supabase = createClient()
      const result = await lookupInvitationCode(supabase, inviteCodeInput)

      if (!result) {
        setError('Invalid or expired invitation code')
        return
      }

      // Accept the invitation by creating the coach-athlete relationship
      await supabase.from('coach_athlete').insert({
        coach_id: result.athlete_id,
        athlete_id: userId,
        status: 'active',
        can_edit: false,
      })

      // Create notification for athlete
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'athlete_added',
        title: 'Coach Connected',
        message: `You are now connected with your coach!`,
        metadata: { coach_id: result.athlete_id },
        read: false,
      })

      // Reload data
      await loadCoachData()
      setShowInviteCoach(false)
      setInviteCodeInput('')
    } catch (err) {
      console.error('Failed to lookup code:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect with coach')
    } finally {
      setIsLookingUpCode(false)
    }
  }
}
