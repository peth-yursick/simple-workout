import { describe, it, expect } from 'vitest'
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  DatabaseError,
  mapSupabaseError,
} from './index'

describe('AppError', () => {
  it('creates an error with correct properties', () => {
    const error = new AppError('Test message', 'TEST_ERROR', 400, true)
    expect(error.message).toBe('Test message')
    expect(error.code).toBe('TEST_ERROR')
    expect(error.statusCode).toBe(400)
    expect(error.recoverable).toBe(true)
    expect(error.name).toBe('AppError')
  })
})

describe('ValidationError', () => {
  it('creates a validation error with correct defaults', () => {
    const error = new ValidationError('Invalid input')
    expect(error.message).toBe('Invalid input')
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.statusCode).toBe(400)
    expect(error.recoverable).toBe(true)
  })
})

describe('NotFoundError', () => {
  it('creates a not found error with resource name', () => {
    const error = new NotFoundError('Workout')
    expect(error.message).toBe('Workout not found')
    expect(error.code).toBe('NOT_FOUND')
    expect(error.statusCode).toBe(404)
    expect(error.recoverable).toBe(false)
  })
})

describe('UnauthorizedError', () => {
  it('creates an unauthorized error with default message', () => {
    const error = new UnauthorizedError()
    expect(error.message).toBe('Unauthorized')
    expect(error.code).toBe('UNAUTHORIZED')
    expect(error.statusCode).toBe(401)
  })

  it('creates an unauthorized error with custom message', () => {
    const error = new UnauthorizedError('Custom message')
    expect(error.message).toBe('Custom message')
  })
})

describe('ConflictError', () => {
  it('creates a conflict error', () => {
    const error = new ConflictError('Resource already exists')
    expect(error.message).toBe('Resource already exists')
    expect(error.code).toBe('CONFLICT')
    expect(error.statusCode).toBe(409)
    expect(error.recoverable).toBe(true)
  })
})

describe('DatabaseError', () => {
  it('creates a database error with original error', () => {
    const originalError = new Error('Connection failed')
    const error = new DatabaseError('Query failed', originalError)
    expect(error.message).toBe('Query failed')
    expect(error.code).toBe('DATABASE_ERROR')
    expect(error.statusCode).toBe(500)
    expect(error.originalError).toBe(originalError)
  })
})

describe('mapSupabaseError', () => {
  it('returns AppError as-is', () => {
    const appError = new ValidationError('Test')
    const result = mapSupabaseError(appError)
    expect(result).toBe(appError)
  })

  it('maps PGRST116 to NotFoundError', () => {
    const supabaseError = { code: 'PGRST116', message: 'Not found' }
    const result = mapSupabaseError(supabaseError, 'Workout')
    expect(result).toBeInstanceOf(NotFoundError)
    expect(result.message).toBe('Workout not found')
  })

  it('maps 23505 (unique constraint) to ConflictError', () => {
    const supabaseError = { code: '23505', details: 'Key (email)=(test@test.com) already exists.' }
    const result = mapSupabaseError(supabaseError)
    expect(result).toBeInstanceOf(ConflictError)
    expect(result.message).toContain('already exists')
  })

  it('maps 23503 (foreign key) to ValidationError', () => {
    const supabaseError = { code: '23503' }
    const result = mapSupabaseError(supabaseError)
    expect(result).toBeInstanceOf(ValidationError)
  })

  it('maps 23502 (not null) to ValidationError', () => {
    const supabaseError = { code: '23502' }
    const result = mapSupabaseError(supabaseError)
    expect(result).toBeInstanceOf(ValidationError)
  })

  it('maps unknown errors to DatabaseError', () => {
    const supabaseError = { code: 'UNKNOWN', message: 'Something went wrong' }
    const result = mapSupabaseError(supabaseError, 'TestContext')
    expect(result).toBeInstanceOf(DatabaseError)
    expect(result.message).toBe('Something went wrong')
  })

  it('handles non-object errors', () => {
    const result = mapSupabaseError('string error')
    expect(result).toBeInstanceOf(DatabaseError)
  })
})
