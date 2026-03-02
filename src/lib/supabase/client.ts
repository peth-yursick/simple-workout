import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Directly access process.env to ensure Next.js inlines these values at build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return createBrowserClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
  )
}
