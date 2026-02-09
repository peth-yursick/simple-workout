/**
 * Environment variable validation
 * Throws clear errors at startup if required variables are missing
 */

const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anonymous key',
} as const

// Placeholder for optional environment variables
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const optionalEnvVars = {
  // Add optional env vars here if needed in the future
} as const

type EnvVar = keyof typeof requiredEnvVars

function getEnvVar(key: EnvVar): string {
  const value = process.env[key]

  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key} (${requiredEnvVars[key]})\n` +
      `Please add it to your .env.local file.`
    )
  }

  return value
}

// Validate all required env vars at import time
function validateEnv() {
  const missing: EnvVar[] = []

  for (const key of Object.keys(requiredEnvVars) as EnvVar[]) {
    if (!process.env[key] || process.env[key]!.trim() === '') {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    const missingList = missing
      .map(k => `  - ${k} (${requiredEnvVars[k]})`)
      .join('\n')

    throw new Error(
      `Missing required environment variables:\n${missingList}\n\n` +
      `Please add them to your .env.local file.`
    )
  }
}

// Validate immediately on import
validateEnv()

export const env = {
  supabaseUrl: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
} as const
