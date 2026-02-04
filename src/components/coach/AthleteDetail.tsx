'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { getAthleteWeeklyReports, getAthleteVideos } from '@/lib/api/coach'
import { markAsReviewed } from '@/lib/api/videos'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface WeeklyReport {
  id: string
  week_number: number
  difficulty_rating: number | null
  energy_level: number | null
  notes: string | null
  coach_notes: string | null
  submitted_at: string
}

interface Video {
  id: string
  exercise_id: string | null
  file_path: string
  duration: number
  weight_kg: number | null
  reps: number | null
  coach_reviewed: boolean
  coach_comment: string | null
  created_at: string
}

interface AthleteDetailProps {
  athleteId: string
  coachId: string
  initialReports: WeeklyReport[]
  initialVideos: Video[]
}

export function AthleteDetail({
  athleteId,
  coachId,
  initialReports,
  initialVideos,
}: AthleteDetailProps) {
  const [activeTab, setActiveTab] = useState<'reports' | 'videos' | 'program'>('reports')
  const [reports, setReports] = useState(initialReports)
  const [videos, setVideos] = useState(initialVideos)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [coachComment, setCoachComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const refreshData = useCallback(async () => {
    const supabase = createClient()
    const [updatedReports, updatedVideos] = await Promise.all([
      getAthleteWeeklyReports(supabase, athleteId),
      getAthleteVideos(supabase, athleteId),
    ])
    setReports(updatedReports)
    setVideos(updatedVideos)
  }, [athleteId])

  const handleReviewVideo = async () => {
    if (!selectedVideo) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      await markAsReviewed(supabase, selectedVideo.id, coachId, coachComment || null)

      // Refresh videos
      await refreshData()
      setSelectedVideo(null)
      setCoachComment('')
    } catch (error) {
      console.error('Failed to submit review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-6">
        <Link
          href="/coach"
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-white">Athlete Details</h1>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'reports'
              ? 'text-blue-400 border-blue-400'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          Weekly Reports
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'videos'
              ? 'text-blue-400 border-blue-400'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          Form Check Videos
        </button>
        <button
          onClick={() => setActiveTab('program')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'program'
              ? 'text-blue-400 border-blue-400'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          Program
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'reports' && (
        <ReportsTab reports={reports} />
      )}

      {activeTab === 'videos' && (
        <VideosTab
          videos={videos}
          selectedVideo={selectedVideo}
          onSelectVideo={setSelectedVideo}
          coachComment={coachComment}
          onCommentChange={setCoachComment}
          onSubmitReview={handleReviewVideo}
          isSubmitting={isSubmitting}
        />
      )}

      {activeTab === 'program' && (
        <ProgramTab />
      )}
    </div>
  )
}

function ReportsTab({ reports }: { reports: WeeklyReport[] }) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No weekly reports yet</h3>
        <p className="text-gray-400">Weekly reports will appear here when the athlete submits them.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Week {report.week_number}</h3>
            <span className="text-sm text-gray-500">
              {new Date(report.submitted_at).toLocaleDateString()}
            </span>
          </div>

          {report.difficulty_rating && (
            <div className="mb-2">
              <span className="text-sm text-gray-400">Difficulty: </span>
              <span className="text-sm text-white">{report.difficulty_rating}/5</span>
            </div>
          )}

          {report.energy_level && (
            <div className="mb-2">
              <span className="text-sm text-gray-400">Energy: </span>
              <span className="text-sm text-white">{report.energy_level}/5</span>
            </div>
          )}

          {report.notes && (
            <div className="mb-3">
              <p className="text-sm text-gray-400 mb-1">Athlete Notes:</p>
              <p className="text-sm text-gray-300">{report.notes}</p>
            </div>
          )}

          {report.coach_notes ? (
            <div className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-900/50">
              <p className="text-sm text-blue-400 mb-1">Coach Notes:</p>
              <p className="text-sm text-gray-300">{report.coach_notes}</p>
            </div>
          ) : (
            <div className="mt-3">
              <button
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                + Add Coach Notes
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

interface VideosTabProps {
  videos: Video[]
  selectedVideo: Video | null
  onSelectVideo: (video: Video) => void
  coachComment: string
  onCommentChange: (comment: string) => void
  onSubmitReview: () => void
  isSubmitting: boolean
}

function VideosTab({
  videos,
  selectedVideo,
  onSelectVideo,
  coachComment,
  onCommentChange,
  onSubmitReview,
  isSubmitting,
}: VideosTabProps) {
  const supabase = createClient()

  if (videos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No videos yet</h3>
        <p className="text-gray-400">Form check videos will appear here when the athlete uploads them.</p>
      </div>
    )
  }

  const getVideoPublicUrl = (filePath: string) => {
    const { data } = supabase.storage.from('workout-videos').getPublicUrl(filePath)
    return data.publicUrl
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Video list */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-3">Videos</h3>
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => onSelectVideo(video)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedVideo?.id === video.id
                ? 'bg-blue-950/50 border-blue-500'
                : 'bg-gray-900 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white font-medium">
                {video.weight_kg}kg × {video.reps || '?'} reps
              </span>
              {video.coach_reviewed && (
                <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded-full">
                  Reviewed
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {new Date(video.created_at).toLocaleDateString()} • {video.duration}s
            </p>
          </button>
        ))}
      </div>

      {/* Video player & review */}
      <div>
        {selectedVideo ? (
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <video
              src={getVideoPublicUrl(selectedVideo.file_path)}
              controls
              className="w-full rounded-lg mb-4 bg-black"
            />

            {selectedVideo.coach_reviewed ? (
              <div className="p-3 bg-green-900/20 rounded-lg border border-green-900/50">
                <p className="text-sm text-green-400 mb-1">Your Review:</p>
                <p className="text-sm text-gray-300">{selectedVideo.coach_comment || 'No comments'}</p>
              </div>
            ) : (
              <div>
                <textarea
                  value={coachComment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  placeholder="Add feedback for the athlete..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                />
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={onSubmitReview}
                  loading={isSubmitting}
                >
                  Submit Review
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
            <p className="text-gray-400">Select a video to review</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProgramTab(): JSX.Element {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Program Overview</h3>
      <p className="text-gray-400 mb-4">View and manage the athlete&apos;s training program</p>
      <p className="text-sm text-gray-500">Program editing coming soon...</p>
    </div>
  )
}
