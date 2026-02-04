'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { parseSpreadsheet, ParseResult } from '@/lib/utils/spreadsheetParser'
import { importPrograms } from '@/app/actions/workout-actions'
import { ImportWarningModal } from './ImportWarningModal'

interface SpreadsheetUploadProps {
  onClose: () => void
}

export function SpreadsheetUpload({ onClose }: SpreadsheetUploadProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.name.endsWith('.xlsx')) {
      setError('Please use .xlsx format')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const result = await parseSpreadsheet(file)
      setParseResult(result)
      setShowWarning(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse spreadsheet')
    } finally {
      setIsLoading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleConfirmImport = async () => {
    if (!parseResult) return

    setIsLoading(true)
    try {
      await importPrograms(parseResult.programs)
      router.refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import routine')
      setShowWarning(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelWarning = () => {
    setShowWarning(false)
    setParseResult(null)
  }

  // Format summary for the warning modal
  const getImportSummary = () => {
    if (!parseResult) return null

    return (
      <div className="text-left text-sm text-gray-300 mt-4 space-y-2">
        <p className="font-medium text-white">Programs to import:</p>
        {parseResult.programs.map((program, idx) => (
          <div key={idx} className="pl-4 py-1 border-l-2 border-gray-700">
            <p className="font-medium">{program.name}</p>
            <p className="text-gray-400">
              {program.weeks.length} week{program.weeks.length !== 1 ? 's' : ''} •{' '}
              {program.weeks.reduce((sum, w) => sum + w.days.reduce((s, d) => s + d.exercises.length, 0), 0)} exercises
            </p>
          </div>
        ))}
        {parseResult.warnings.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-900/30 rounded text-yellow-300 text-xs">
            {parseResult.warnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 p-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {isLoading ? 'Processing...' : 'Upload Routine'}
      </button>

      {error && (
        <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
      )}

      {showWarning && parseResult && (
        <ImportWarningModal
          onCancel={handleCancelWarning}
          onConfirm={handleConfirmImport}
          isLoading={isLoading}
          summary={getImportSummary()}
        />
      )}
    </>
  )
}
