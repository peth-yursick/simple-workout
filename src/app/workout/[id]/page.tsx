import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getWorkoutWithExercises } from '@/lib/api/workouts'
import { WorkoutHeader } from '@/components/workout/WorkoutHeader'

interface WorkoutPageProps {
  params: Promise<{ id: string }>
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const workout = await getWorkoutWithExercises(supabase, id)

  if (!workout) {
    notFound()
  }

  const doneCount = workout.exercises.filter(e => e.status === 'complete' || e.status === 'skipped').length
  const totalCount = workout.exercises.length

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-lg mx-auto px-4 py-8">
        <WorkoutHeader
          workout={workout}
          exercises={workout.exercises}
          doneCount={doneCount}
          totalCount={totalCount}
        />
      </div>
    </div>
  )
}
