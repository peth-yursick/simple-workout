'use client'

import { useState, useRef, useEffect } from 'react'
import { compressVideo, getDuration } from '@/lib/utils/videoCompression'
import { uploadVideo } from '@/lib/api/videos'
import { createClient } from '@/lib/supabase/client'
import { Exercise } from '@/lib/types/database'

interface VideoRecorderProps {
  exercise: Exercise
  onComplete: () => void
  onCancel: () => void
}

export function VideoRecorder({ exercise, onComplete, onCancel }: VideoRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [compressionProgress, setCompressionProgress] = useState(0)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recordedBlobRef = useRef<Blob | null>(null)

  const MAX_DURATION = 30 // seconds

  useEffect(() => {
    startCamera()

    return () => {
      stopCamera()
    }
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      setError('Failed to access camera. Please grant camera permissions.')
      console.error('Camera error:', err)
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  function startRecording() {
    if (!streamRef.current) {
      setError('Camera not ready')
      return
    }

    chunksRef.current = []
    setRecordingDuration(0)
    setRecording(true)

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp8',
      videoBitsPerSecond: 2500000 // 2.5 Mbps
    })

    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      recordedBlobRef.current = blob
      setRecorded(true)

      if (videoRef.current) {
        videoRef.current.srcObject = null
        videoRef.current.src = URL.createObjectURL(blob)
      }
    }

    mediaRecorder.start(100) // Collect data every 100ms

    // Timer
    timerRef.current = setInterval(() => {
      setRecordingDuration(prev => {
        const next = prev + 0.1

        // Auto-stop at max duration
        if (next >= MAX_DURATION) {
          stopRecording()
          return MAX_DURATION
        }

        return next
      })
    }, 100)
  }

  function stopRecording() {
    setRecording(false)

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    stopCamera()
  }

  function retake() {
    setRecorded(false)
    recordedBlobRef.current = null
    setRecordingDuration(0)
    startCamera()
  }

  async function handleUpload() {
    if (!recordedBlobRef.current) return

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get last set data for reps/weight - fetch it since Exercise doesn't include sets
      const { data: exerciseWithSets } = await supabase
        .from('exercises')
        .select('exercise_sets')
        .eq('id', exercise.id)
        .single()

      const exerciseSets = exerciseWithSets?.exercise_sets as Array<{ completed_at: string | null; skipped: boolean; reps_completed: number | null }> | undefined
      const lastSet = exerciseSets?.find(s => s.completed_at && !s.skipped)

      // Step 1: Compress video
      const compressedBlob = await compressVideo(
        new File([recordedBlobRef.current], 'video.webm', { type: 'video/webm' }),
        (progress) => setCompressionProgress(progress)
      )

      // Step 2: Get video duration
      const duration = await getDuration(compressedBlob)

      // Step 3: Upload to server
      await uploadVideo(supabase, {
        userId: user.id,
        exerciseId: exercise.id,
        videoBlob: compressedBlob,
        duration: duration,
        weightKg: exercise.weight_kg,
        reps: lastSet?.reps_completed || null,
        onProgress: (progress) => setUploadProgress(progress)
      })

      onComplete()
    } catch (err) {
      setError('Upload failed. Please try again.')
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="max-w-lg w-full">
        {/* Video container */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Recording indicator */}
          {recording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">
                REC {recordingDuration.toFixed(1)}s / {MAX_DURATION}s
              </span>
            </div>
          )}

          {/* Upload overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6">
              <p className="text-yellow-400 text-sm font-medium mb-4">⚠️ Do not close the app</p>

              {compressionProgress < 100 ? (
                <div className="w-full max-w-xs">
                  <p className="text-white text-sm mb-2">Compressing video...</p>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${compressionProgress}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-xs text-center">{compressionProgress}%</p>
                </div>
              ) : (
                <div className="w-full max-w-xs">
                  <p className="text-white text-sm mb-2">Uploading to coach...</p>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-xs text-center">{uploadProgress}%</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="mt-4 flex gap-3">
          {!recording && !recorded && !uploading && (
            <>
              <button
                onClick={startRecording}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8" />
                </svg>
                Start Recording
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {recording && (
            <button
              onClick={stopRecording}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Stop Recording
            </button>
          )}

          {recorded && !uploading && (
            <>
              <button
                onClick={handleUpload}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Upload Video
              </button>
              <button
                onClick={retake}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Retake
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Exercise info */}
        <div className="mt-4 text-center">
          <p className="text-white font-medium">{exercise.name}</p>
          <p className="text-gray-400 text-sm">
            {exercise.weight_kg}kg × {exercise.sets} sets
          </p>
        </div>
      </div>
    </div>
  )
}
