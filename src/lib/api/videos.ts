import { SupabaseClient } from '@supabase/supabase-js'
import { VideoUpload } from '@/lib/types/database'

export async function uploadVideo(
  supabase: SupabaseClient,
  data: {
    userId: string
    exerciseId: string | null
    videoBlob: Blob
    duration: number
    weightKg: number | null
    reps: number | null
    onProgress?: (progress: number) => void
  }
): Promise<VideoUpload> {
  const { userId, exerciseId, videoBlob, duration, weightKg, reps, onProgress } = data

  // Generate unique filename
  const timestamp = Date.now()
  const filename = `${userId}/${timestamp}.webm`

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('workout-videos')
    .upload(filename, videoBlob, {
      contentType: 'video/webm',
      upsert: false,
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    throw new Error(`Failed to upload video: ${uploadError.message}`)
  }

  onProgress?.(100)

  // Create database record
  const { data: videoRecord, error: dbError } = await supabase
    .from('video_uploads')
    .insert({
      user_id: userId,
      exercise_id: exerciseId,
      file_path: uploadData.path,
      file_size: videoBlob.size,
      duration: Math.round(duration),
      weight_kg: weightKg,
      reps: reps,
      coach_reviewed: false,
      auto_delete_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    })
    .select()
    .single()

  if (dbError) {
    // If database insert fails, clean up the uploaded file
    await supabase.storage.from('workout-videos').remove([uploadData.path])
    throw dbError
  }

  return videoRecord as VideoUpload
}

export async function getVideosByExercise(
  supabase: SupabaseClient,
  exerciseId: string
): Promise<VideoUpload[]> {
  const { data, error } = await supabase
    .from('video_uploads')
    .select('*')
    .eq('exercise_id', exerciseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as VideoUpload[]
}

export async function getVideosByUser(
  supabase: SupabaseClient,
  userId: string,
  limit = 20
): Promise<VideoUpload[]> {
  const { data, error } = await supabase
    .from('video_uploads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as VideoUpload[]
}

export async function getVideoUrl(
  supabase: SupabaseClient,
  filePath: string
): Promise<string> {
  const { data } = supabase.storage
    .from('workout-videos')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function deleteVideo(
  supabase: SupabaseClient,
  videoId: string
): Promise<void> {
  // First get the file path
  const { data: video } = await supabase
    .from('video_uploads')
    .select('file_path')
    .eq('id', videoId)
    .single()

  if (!video) throw new Error('Video not found')

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('workout-videos')
    .remove([video.file_path])

  if (storageError) {
    console.error('Failed to delete from storage:', storageError)
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('video_uploads')
    .delete()
    .eq('id', videoId)

  if (dbError) throw dbError
}

export async function markAsReviewed(
  supabase: SupabaseClient,
  videoId: string,
  coachId: string,
  comment: string | null
): Promise<VideoUpload> {
  const { data, error } = await supabase
    .from('video_uploads')
    .update({
      coach_reviewed: true,
      coach_id: coachId,
      coach_comment: comment,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', videoId)
    .select()
    .single()

  if (error) throw error
  return data as VideoUpload
}
