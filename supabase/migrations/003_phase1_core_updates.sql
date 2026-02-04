-- Phase 1 Core Updates: RPE/RIR, Day Names, Main Exercises, Toughness, 0.5kg weights
-- This migration adds core features while maintaining backward compatibility

-- ============================================================================
-- 1. UPDATE WEIGHT_KG TO SUPPORT 0.5kg INCREMENTS
-- ============================================================================

-- Change weight_kg to numeric(5,1) to support 0.5kg increments (max 999.9kg)
alter table exercises alter column weight_kg type numeric(5,1);
alter table exercise_templates alter column weight_kg type numeric(5,1);

-- ============================================================================
-- 2. ADD DAY_NAME TO WORKOUTS
-- ============================================================================

alter table workouts add column day_name text;
alter table workouts add column skipped_at timestamp with time zone;

-- Create index for filtering by day_name
create index idx_workouts_day_name on workouts(user_id, week_number, day_name);

-- ============================================================================
-- 3. ADD RPE/RIR TO EXERCISES AND EXERCISE_SETS
-- ============================================================================

-- Add RPE (6-10, 0.5 increments) and RIR (0-3) to exercises
alter table exercises add column uses_rpe boolean not null default true;
alter table exercises add column uses_rir boolean not null default false;
alter table exercises add column target_rpe_min numeric(3,1) check (target_rpe_min between 6 and 10);
alter table exercises add column target_rpe_max numeric(3,1) check (target_rpe_max between 6 and 10);
alter table exercises add column target_rir_min integer check (target_rir_min between 0 and 3);
alter table exercises add column target_rir_max integer check (target_rir_max between 0 and 3);

-- Add RPE/RIR to exercise_sets (actual recorded values)
alter table exercise_sets add column rpe numeric(3,1) check (rpe between 6 and 10);
alter table exercise_sets add column rir integer check (rir between 0 and 3);

-- Add RPE/RIR to exercise_templates
alter table exercise_templates add column uses_rpe boolean not null default true;
alter table exercise_templates add column uses_rir boolean not null default false;
alter table exercise_templates add column target_rpe_min numeric(3,1) check (target_rpe_min between 6 and 10);
alter table exercise_templates add column target_rpe_max numeric(3,1) check (target_rpe_max between 6 and 10);
alter table exercise_templates add column target_rir_min integer check (target_rir_min between 0 and 3);
alter table exercise_templates add column target_rir_max integer check (target_rir_max between 0 and 3);

-- Add constraints for RPE/RIR ranges
alter table exercises add constraint exercises_rpe_range check (target_rpe_min <= target_rpe_max);
alter table exercises add constraint exercises_rir_range check (target_rir_min <= target_rir_max);
alter table exercise_templates add constraint exercise_templates_rpe_range check (target_rpe_min <= target_rpe_max);
alter table exercise_templates add constraint exercise_templates_rir_range check (target_rir_min <= target_rir_max);

-- Create indexes for RPE/RIR queries
create index idx_exercises_uses_rpe on exercises(workout_id) where uses_rpe = true;
create index idx_exercises_uses_rir on exercises(workout_id) where uses_rir = true;

-- ============================================================================
-- 4. ADD MAIN EXERCISE FLAG & TOUGHNESS RATING
-- ============================================================================

-- Add is_main_exercise flag (star important exercises)
alter table exercises add column is_main_exercise boolean not null default false;

-- Add toughness_rating (1-5, how difficult the exercise feels)
alter table exercises add column toughness_rating integer check (toughness_rating between 1 and 5);

-- Add to exercise_templates as well
alter table exercise_templates add column is_main_exercise boolean not null default false;
alter table exercise_templates add column toughness_rating integer check (toughness_rating between 1 and 5);

-- Create index for main exercises
create index idx_exercises_main on exercises(workout_id) where is_main_exercise = true;
create index idx_exercises_toughness on exercises(workout_id, toughness_rating);

-- ============================================================================
-- 5. ADD WEIGHT_DIRECTION FOR ASSISTED EXERCISES
-- ============================================================================

-- Add weight_direction: 'increase' (normal) or 'decrease' (assisted exercises)
alter table exercises add column weight_direction text not null default 'increase' check (weight_direction in ('increase', 'decrease'));
alter table exercise_templates add column weight_direction text not null default 'increase' check (weight_direction in ('increase', 'decrease'));

-- ============================================================================
-- 6. CREATE EXERCISE_LIBRARY TABLE
-- ============================================================================

create table exercise_library (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  aliases text[] not null default '{}',
  category text not null check (category in ('compound', 'isolation', 'accessory')),
  movement_type text not null check (movement_type in ('push', 'pull', 'legs', 'core')),
  equipment text not null check (equipment in ('barbell', 'dumbbell', 'machine', 'bodyweight', 'cable', 'other', 'kettlebell', 'band')),
  primary_muscles jsonb not null default '[]',
  secondary_muscles jsonb not null default '[]',
  weight_direction text not null default 'increase' check (weight_direction in ('increase', 'decrease')),
  base_exercise_id uuid references exercise_library(id),
  equivalency_ratio numeric(4,2) not null default 1.0,
  uses_rpe boolean not null default true,
  uses_rir boolean not null default false,
  created_at timestamp with time zone default now() not null
);

-- Create indexes for exercise library searches
create index idx_exercise_library_name on exercise_library using gin(to_tsvector('english', name));
create index idx_exercise_library_aliases on exercise_library using gin(aliases);
create index idx_exercise_library_category on exercise_library(category);
create index idx_exercise_library_movement on exercise_library(movement_type);
create index idx_exercise_library_equipment on exercise_library(equipment);
create index idx_exercise_library_base on exercise_library(base_exercise_id);

-- RLS for exercise_library (read-only for all users)
alter table exercise_library enable row level security;

create policy "Anyone can view exercise library"
  on exercise_library for select
  using (true);

-- ============================================================================
-- 7. LINK EXERCISES TO EXERCISE_LIBRARY (OPTIONAL)
-- ============================================================================

-- Add optional reference to exercise_library
alter table exercises add column exercise_library_id uuid references exercise_library(id);
alter table exercise_templates add column exercise_library_id uuid references exercise_library(id);

-- Create index
create index idx_exercises_library on exercises(exercise_library_id);
create index idx_exercise_templates_library on exercise_templates(exercise_library_id);

-- ============================================================================
-- 8. CREATE VIDEO_UPLOADS TABLE (for form check videos)
-- ============================================================================

create table video_uploads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  exercise_id uuid references exercises(id) on delete cascade,
  file_path text not null,
  file_size bigint not null,
  duration numeric(5,1) not null,
  weight_kg numeric(5,1),
  reps integer,
  coach_reviewed boolean not null default false,
  coach_comment text,
  coach_id uuid references profiles(id),
  reviewed_at timestamp with time zone,
  auto_delete_at timestamp with time zone not null,
  created_at timestamp with time zone default now() not null
);

-- Create indexes
create index idx_video_uploads_user on video_uploads(user_id);
create index idx_video_uploads_exercise on video_uploads(exercise_id);
create index idx_video_uploads_coach on video_uploads(coach_id);
create index idx_video_uploads_auto_delete on video_uploads(auto_delete_at) where coach_reviewed = false;

-- RLS for video_uploads
alter table video_uploads enable row level security;

create policy "Users can view own videos"
  on video_uploads for select
  using (auth.uid() = user_id);

create policy "Coaches can view athlete videos"
  on video_uploads for select
  using (
    exists (
      select 1 from coach_athlete
      where coach_athlete.athlete_id = video_uploads.user_id
      and coach_athlete.coach_id = auth.uid()
      and coach_athlete.status = 'active'
    )
  );

create policy "Users can insert own videos"
  on video_uploads for insert
  with check (auth.uid() = user_id);

create policy "Coaches can update videos"
  on video_uploads for update
  using (
    auth.uid() = user_id
    or exists (
      select 1 from coach_athlete
      where coach_athlete.athlete_id = video_uploads.user_id
      and coach_athlete.coach_id = auth.uid()
      and coach_athlete.status = 'active'
    )
  );

create policy "Users can delete own videos"
  on video_uploads for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- 9. CREATE NOTIFICATIONS TABLE
-- ============================================================================

create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in ('coach_update', 'video_reviewed', 'weekly_report_submitted', 'athlete_added', 'week_complete')),
  title text not null,
  message text not null,
  metadata jsonb not null default '{}',
  read boolean not null default false,
  created_at timestamp with time zone default now() not null
);

-- Create indexes
create index idx_notifications_user_unread on notifications(user_id, read, created_at desc);
create index idx_notifications_user_type on notifications(user_id, type, created_at desc);

-- RLS for notifications
alter table notifications enable row level security;

create policy "Users can view own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can insert own notifications"
  on notifications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notifications"
  on notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete own notifications"
  on notifications for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- 10. CREATE COACH_ATHLETE TABLE (for coach mode)
-- ============================================================================

create table coach_athlete (
  id uuid default uuid_generate_v4() primary key,
  coach_id uuid references profiles(id) on delete cascade not null,
  athlete_id uuid references profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'ended')),
  can_edit boolean not null default true,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,

  unique(coach_id, athlete_id),
  check (coach_id != athlete_id)
);

-- Create indexes
create index idx_coach_athlete_coach on coach_athlete(coach_id, status);
create index idx_coach_athlete_athlete on coach_athlete(athlete_id, status);

-- RLS for coach_athlete
alter table coach_athlete enable row level security;

create policy "Users can view own coaching relationships"
  on coach_athlete for select
  using (auth.uid() = coach_id or auth.uid() = athlete_id);

create policy "Users can insert own coaching relationships"
  on coach_athlete for insert
  with check (auth.uid() = coach_id or auth.uid() = athlete_id);

create policy "Users can update own coaching relationships"
  on coach_athlete for update
  using (auth.uid() = coach_id or auth.uid() = athlete_id);

-- ============================================================================
-- 11. CREATE USAGE_TRACKING TABLE (for coach billing)
-- ============================================================================

create table usage_tracking (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  usage_type text not null check (usage_type in ('video_upload', 'storage', 'athlete_count')),
  amount bigint not null,
  created_at timestamp with time zone default now() not null
);

-- Create indexes
create index idx_usage_tracking_user_type on usage_tracking(user_id, usage_type, created_at);
create index idx_usage_tracking_period on usage_tracking(created_at);

-- RLS for usage_tracking
alter table usage_tracking enable row level security;

create policy "Users can view own usage"
  on usage_tracking for select
  using (auth.uid() = user_id);

create policy "Users can insert own usage"
  on usage_tracking for insert
  with check (auth.uid() = user_id);

-- ============================================================================
-- 12. CREATE COACH_USAGE_SUMMARY TABLE (monthly billing summaries)
-- ============================================================================

create table coach_usage_summary (
  id uuid default uuid_generate_v4() primary key,
  coach_id uuid references profiles(id) on delete cascade not null,
  period_start date not null,
  period_end date not null,
  total_athletes integer not null default 0,
  total_storage_bytes bigint not null default 0,
  total_video_uploads integer not null default 0,
  estimated_cost_usd numeric(10,2) not null default 0,
  created_at timestamp with time zone default now() not null,

  unique(coach_id, period_start, period_end)
);

-- Create indexes
create index idx_coach_usage_summary_coach on coach_usage_summary(coach_id, period_end desc);

-- RLS for coach_usage_summary
alter table coach_usage_summary enable row level security;

create policy "Coaches can view own usage summary"
  on coach_usage_summary for select
  using (auth.uid() = coach_id);

-- ============================================================================
-- 13. CREATE WEEKLY_REPORTS TABLE
-- ============================================================================

create table weekly_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  program_id uuid references programs(id) on delete cascade,
  week_number integer not null,
  difficulty_rating integer check (difficulty_rating between 1 and 5),
  energy_level integer check (energy_level between 1 and 5),
  sleep_quality integer check (sleep_quality between 1 and 5),
  stress_level integer check (stress_level between 1 and 5),
  soreness_level integer check (soreness_level between 1 and 5),
  notes text,
  coach_notes text,
  coach_recommendations jsonb not null default '[]',
  submitted_at timestamp with time zone default now() not null,
  coach_reviewed_at timestamp with time zone,

  unique(user_id, program_id, week_number)
);

-- Create indexes
create index idx_weekly_reports_user on weekly_reports(user_id, week_number desc);
create index idx_weekly_reports_program on weekly_reports(program_id, week_number);

-- RLS for weekly_reports
alter table weekly_reports enable row level security;

create policy "Users can view own reports"
  on weekly_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert own reports"
  on weekly_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reports"
  on weekly_reports for update
  using (auth.uid() = user_id);

create policy "Coaches can view athlete reports"
  on weekly_reports for select
  using (
    exists (
      select 1 from coach_athlete
      where coach_athlete.athlete_id = weekly_reports.user_id
      and coach_athlete.coach_id = auth.uid()
      and coach_athlete.status = 'active'
    )
  );

create policy "Coaches can update athlete reports"
  on weekly_reports for update
  using (
    exists (
      select 1 from coach_athlete
      where coach_athlete.athlete_id = weekly_reports.user_id
      and coach_athlete.coach_id = auth.uid()
      and coach_athlete.status = 'active'
    )
  );

-- ============================================================================
-- 14. STORAGE BUCKET FOR VIDEOS (reference - create in Supabase dashboard)
-- ============================================================================
-- Bucket name: form-check-videos
-- Public: false
-- File size limit: 50MB
-- Allowed MIME types: video/*

-- To create via SQL:
-- insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- values ('form-check-videos', 'form-check-videos', false, 52428800, ARRAY['video/webm', 'video/mp4', 'video/quicktime']);
