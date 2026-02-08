/**
 * Typed error classes for consistent error handling
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public recoverable: boolean = false
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace?.(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400, true)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404, false)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401, false)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409, true)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, public originalError?: unknown) {
    super(message, 'DATABASE_ERROR', 500, false)
  }
}

/**
 * Maps Supabase errors to AppError types
 */
export function mapSupabaseError(error: unknown, context?: string): AppError {
  // If already an AppError, return as-is
  if (error instanceof AppError) {
    return error
  }

  // Handle Supabase errors
  if (error && typeof error === 'object') {
    const err = error as { code?: string; message?: string; details?: string }

    // PGRST116 = not found
    if (err.code === 'PGRST116') {
      return new NotFoundError(context || 'Resource')
    }

    // 23505 = unique constraint violation
    if (err.code === '23505') {
      return new ConflictError(err.details || 'A conflict occurred with existing data')
    }

    // 23503 = foreign key violation
    if (err.code === '23503') {
      return new ValidationError('Referenced resource does not exist')
    }

    // 23502 = not null violation
    if (err.code === '23502') {
      return new ValidationError('Required field is missing')
    }

    // Generic database error with context
    const message = err.message || 'An unexpected database error occurred'
    return new DatabaseError(message, error)
  }

  // Unknown error type
  return new DatabaseError(
    error instanceof Error ? error.message : 'An unknown error occurred',
    error
  )
}
