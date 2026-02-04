import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings } from '@/components/settings/Settings'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Settings userId={user.id} />
      </div>
    </div>
  )
}
