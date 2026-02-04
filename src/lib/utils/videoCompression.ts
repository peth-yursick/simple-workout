/**
 * Video compression utilities using browser APIs
 * Compresses video files before upload to reduce bandwidth and storage
 */

export async function compressVideo(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  // For now, we'll use a simple approach:
  // 1. Check if video is already small enough
  // 2. If not, we'll need to re-encode (complex, requires ffmpeg.wasm or similar)

  const MAX_SIZE = 50 * 1024 * 1024 // 50MB
  onProgress?.(0)

  // If file is small enough, return as-is
  if (file.size <= MAX_SIZE) {
    onProgress?.(100)
    return file
  }

  // For larger files, we'd need to re-encode
  // This is a simplified version - in production you'd use ffmpeg.wasm
  // For now, we'll just warn and return the file
  console.warn('Video is larger than 50MB, may take longer to upload')

  onProgress?.(100)
  return file
}

/**
 * Get video duration in seconds
 */
export async function getDuration(file: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('Failed to load video metadata'))
    }

    video.src = URL.createObjectURL(file)
  })
}

/**
 * Generate thumbnail from video at specific timestamp
 */
export async function generateThumbnail(
  file: Blob,
  timeSeconds: number = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.currentTime = timeSeconds

    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(video.src)
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to generate thumbnail'))
        }
      }, 'image/jpeg', 0.8)
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('Failed to load video for thumbnail'))
    }

    video.src = URL.createObjectURL(file)
  })
}
