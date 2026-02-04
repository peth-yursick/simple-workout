export type ExerciseStatus = 'incomplete' | 'complete' | 'skipped'
export type WeightRecommendationType = 'consider' | 'recommended'
export type ProgramStatus = 'active' | 'completed' | 'upcoming'

export interface Profile {
  id: string
  current_week: number
  current_program_id: string | null
  current_level: number
  level_progress: number
  created_at: string
  updated_at: string
}

// Program represents a training phase/cycle (e.g., "Phase 1")
export interface Program {
  id: string
  user_id: string
  name: string
  total_weeks: number
  current_week: number
  order: number
  status: ProgramStatus
  created_at: string
}

// WeekTemplate stores the exercise prescription for a specific week
export interface WeekTemplate {
  id: string
  program_id: string
  week_number: number
  created_at: string
}

// ExerciseTemplate stores the exercise definition for a week/day
export interface ExerciseTemplate {
  id: string
  week_template_id: string
  day_number: number
  name: string
  order: number
  sets: number
  weight_kg: number
  rep_min: number
  rep_max: number
  target_effort_min: number
  target_effort_max: number
  created_at: string
}

export interface Workout {
  id: string
  user_id: string
  program_id: string | null
  week_number: number
  day_number: number
  completed_at: string | null
  skipped_at: string | null
  created_at: string
}

export interface Exercise {
  id: string
  workout_id: string
  template_id: string | null
  name: string
  order: number
  sets: number
  weight_kg: number
  rep_min: number
  rep_max: number
  target_effort_min: number
  target_effort_max: number
  status: ExerciseStatus
  created_at: string
}

export interface ExerciseSet {
  id: string
  exercise_id: string
  set_number: number
  reps_completed: number | null
  effort_percentage: number | null
  skipped: boolean
  completed_at: string | null
  created_at: string
}

export interface WeightRecommendationExercise {
  exercise_id: string
  exercise_name: string
  current_weight: number
  recommendation: WeightRecommendationType
}

export interface WeightRecommendation {
  id: string
  user_id: string
  week_number: number
  exercises: WeightRecommendationExercise[]
  dismissed: boolean
  created_at: string
}

// Extended types with relations
export interface ExerciseWithSets extends Exercise {
  exercise_sets: ExerciseSet[]
}

export interface WorkoutWithExercises extends Workout {
  exercises: ExerciseWithSets[]
}

export interface WeekTemplateWithExercises extends WeekTemplate {
  exercise_templates: ExerciseTemplate[]
}

export interface ProgramWithWeeks extends Program {
  week_templates: WeekTemplateWithExercises[]
}

// Database schema type for Supabase client
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: {
          id: string
          current_week?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          current_week?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      workouts: {
        Row: Workout
        Insert: {
          id?: string
          user_id: string
          week_number: number
          day_number: number
          completed_at?: string | null
          skipped_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_number?: number
          day_number?: number
          completed_at?: string | null
          skipped_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      exercises: {
        Row: Exercise
        Insert: {
          id?: string
          workout_id: string
          name: string
          order: number
          sets: number
          weight_kg: number
          rep_min: number
          rep_max: number
          target_effort_min: number
          target_effort_max: number
          status?: ExerciseStatus
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          name?: string
          order?: number
          sets?: number
          weight_kg?: number
          rep_min?: number
          rep_max?: number
          target_effort_min?: number
          target_effort_max?: number
          status?: ExerciseStatus
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          }
        ]
      }
      exercise_sets: {
        Row: ExerciseSet
        Insert: {
          id?: string
          exercise_id: string
          set_number: number
          reps_completed?: number | null
          effort_percentage?: number | null
          skipped?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          exercise_id?: string
          set_number?: number
          reps_completed?: number | null
          effort_percentage?: number | null
          skipped?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          }
        ]
      }
      weight_recommendations: {
        Row: WeightRecommendation
        Insert: {
          id?: string
          user_id: string
          week_number: number
          exercises?: WeightRecommendationExercise[]
          dismissed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_number?: number
          exercises?: WeightRecommendationExercise[]
          dismissed?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weight_recommendations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
