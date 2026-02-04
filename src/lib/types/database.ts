export type ExerciseStatus = 'incomplete' | 'complete' | 'skipped'
export type WeightRecommendationType = 'consider' | 'recommended'
export type ProgramStatus = 'active' | 'completed' | 'upcoming'
export type WeightDirection = 'increase' | 'decrease'
export type NotificationType = 'coach_update' | 'video_reviewed' | 'weekly_report_submitted' | 'athlete_added' | 'week_complete'
export type CoachAthleteStatus = 'pending' | 'active' | 'ended'
export type UsageType = 'video_upload' | 'storage' | 'athlete_count'
export type ExerciseCategory = 'compound' | 'isolation' | 'accessory'
export type MovementType = 'push' | 'pull' | 'legs' | 'core'
export type EquipmentType = 'barbell' | 'dumbbell' | 'machine' | 'bodyweight' | 'cable' | 'other' | 'kettlebell' | 'band'

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

// ExerciseLibrary - master list of exercises with metadata
export interface ExerciseLibrary {
  id: string
  name: string
  aliases: string[]
  category: ExerciseCategory
  movement_type: MovementType
  equipment: EquipmentType
  primary_muscles: { muscle: string; activation: number }[]
  secondary_muscles: { muscle: string; activation: number }[]
  weight_direction: WeightDirection
  base_exercise_id: string | null
  equivalency_ratio: number
  uses_rpe: boolean
  uses_rir: boolean
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
  // Phase 1 additions
  uses_rpe: boolean
  uses_rir: boolean
  target_rpe_min: number | null
  target_rpe_max: number | null
  target_rir_min: number | null
  target_rir_max: number | null
  is_main_exercise: boolean
  toughness_rating: number | null
  weight_direction: WeightDirection
  exercise_library_id: string | null
  created_at: string
}

export interface Workout {
  id: string
  user_id: string
  program_id: string | null
  week_number: number
  day_number: number
  day_name: string | null // Phase 1: customizable day names
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
  // Phase 1 additions
  uses_rpe: boolean
  uses_rir: boolean
  target_rpe_min: number | null
  target_rpe_max: number | null
  target_rir_min: number | null
  target_rir_max: number | null
  is_main_exercise: boolean
  toughness_rating: number | null
  weight_direction: WeightDirection
  exercise_library_id: string | null
  created_at: string
}

export interface ExerciseSet {
  id: string
  exercise_id: string
  set_number: number
  reps_completed: number | null
  effort_percentage: number | null
  // Phase 1 additions
  rpe: number | null // 6-10, 0.5 increments
  rir: number | null // 0-3
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

// Video uploads for form checks
export interface VideoUpload {
  id: string
  user_id: string
  exercise_id: string | null
  file_path: string
  file_size: number
  duration: number
  weight_kg: number | null
  reps: number | null
  coach_reviewed: boolean
  coach_comment: string | null
  coach_id: string | null
  reviewed_at: string | null
  auto_delete_at: string
  created_at: string
}

// Notifications
export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  metadata: Record<string, unknown>
  read: boolean
  created_at: string
}

// Coach-Athlete relationship
export interface CoachAthlete {
  id: string
  coach_id: string
  athlete_id: string
  status: CoachAthleteStatus
  can_edit: boolean
  started_at: string | null
  ended_at: string | null
  created_at: string
}

// Usage tracking for billing
export interface UsageTracking {
  id: string
  user_id: string
  usage_type: UsageType
  amount: number
  created_at: string
}

// Monthly usage summary for coaches
export interface CoachUsageSummary {
  id: string
  coach_id: string
  period_start: string // date
  period_end: string // date
  total_athletes: number
  total_storage_bytes: number
  total_video_uploads: number
  estimated_cost_usd: number
  created_at: string
}

// Weekly reports from athletes
export interface WeeklyReport {
  id: string
  user_id: string
  program_id: string | null
  week_number: number
  difficulty_rating: number | null // 1-5
  energy_level: number | null // 1-5
  sleep_quality: number | null // 1-5
  stress_level: number | null // 1-5
  soreness_level: number | null // 1-5
  notes: string | null
  coach_notes: string | null
  coach_recommendations: unknown[] // JSONB array of recommendations
  submitted_at: string
  coach_reviewed_at: string | null
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
          day_name?: string | null
          completed_at?: string | null
          skipped_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_number?: number
          day_number?: number
          day_name?: string | null
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
          uses_rpe?: boolean
          uses_rir?: boolean
          target_rpe_min?: number | null
          target_rpe_max?: number | null
          target_rir_min?: number | null
          target_rir_max?: number | null
          is_main_exercise?: boolean
          toughness_rating?: number | null
          weight_direction?: WeightDirection
          exercise_library_id?: string | null
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
          uses_rpe?: boolean
          uses_rir?: boolean
          target_rpe_min?: number | null
          target_rpe_max?: number | null
          target_rir_min?: number | null
          target_rir_max?: number | null
          is_main_exercise?: boolean
          toughness_rating?: number | null
          weight_direction?: WeightDirection
          exercise_library_id?: string | null
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
          rpe?: number | null
          rir?: number | null
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
          rpe?: number | null
          rir?: number | null
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
      // New Phase 1 tables (minimal types for now)
      exercise_library: {
        Row: ExerciseLibrary
        Insert: Partial<ExerciseLibrary>
        Update: Partial<ExerciseLibrary>
        Relationships: []
      }
      video_uploads: {
        Row: VideoUpload
        Insert: Partial<VideoUpload>
        Update: Partial<VideoUpload>
        Relationships: []
      }
      notifications: {
        Row: Notification
        Insert: Partial<Notification>
        Update: Partial<Notification>
        Relationships: []
      }
      coach_athlete: {
        Row: CoachAthlete
        Insert: Partial<CoachAthlete>
        Update: Partial<CoachAthlete>
        Relationships: []
      }
      usage_tracking: {
        Row: UsageTracking
        Insert: Partial<UsageTracking>
        Update: Partial<UsageTracking>
        Relationships: []
      }
      coach_usage_summary: {
        Row: CoachUsageSummary
        Insert: Partial<CoachUsageSummary>
        Update: Partial<CoachUsageSummary>
        Relationships: []
      }
      weekly_reports: {
        Row: WeeklyReport
        Insert: Partial<WeeklyReport>
        Update: Partial<WeeklyReport>
        Relationships: []
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
