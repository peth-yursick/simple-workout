-- ============================================================================
-- COMPLETE DATABASE SETUP
-- This combines all migrations (001, 002, 003) into one file
-- Run this in Supabase SQL Editor to set up the entire database from scratch
-- ============================================================================

-- CLEANUP: Drop problematic tables from previous failed migrations
drop table if exists weekly_reports cascade;
drop table if exists coach_usage_summary cascade;
drop table if exists usage_tracking cascade;
drop table if exists notifications cascade;
drop table if exists video_uploads cascade;
drop table if exists coach_athlete cascade;
drop table if exists exercise_library cascade;

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================================
-- MIGRATION 001: INITIAL SCHEMA
-- ============================================================================

-- Profiles table (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  current_week integer not null default 1,
  current_level integer not null default 1,
  level_progress decimal(5,2) not null default 0,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Workouts table (7 days per week)
create table if not exists workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  program_id uuid,
  week_number integer not null,
  day_number integer not null check (day_number between 1 and 7),
  day_name text,
  skipped_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,

  unique(user_id, week_number, day_number)
);

-- Exercises table
create table if not exists exercises (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references workouts(id) on delete cascade not null,
  template_id uuid,
  name text not null,
  "order" integer not null,
  sets integer not null check (sets between 1 and 9),
  weight_kg numeric(5,1) not null check (weight_kg between 0 and 500),
  rep_min integer not null,
  rep_max integer not null,
  target_effort_min integer not null check (target_effort_min between 0 and 100),
  target_effort_max integer not null check (target_effort_max between 0 and 100),
  status text not null default 'incomplete' check (status in ('incomplete', 'complete', 'skipped')),
  uses_rpe boolean not null default true,
  uses_rir boolean not null default false,
  target_rpe_min numeric(3,1) check (target_rpe_min between 6 and 10),
  target_rpe_max numeric(3,1) check (target_rpe_max between 6 and 10),
  target_rir_min integer check (target_rir_min between 0 and 3),
  target_rir_max integer check (target_rir_max between 0 and 3),
  is_main_exercise boolean not null default false,
  toughness_rating integer check (toughness_rating between 1 and 5),
  weight_direction text not null default 'increase' check (weight_direction in ('increase', 'decrease')),
  exercise_library_id uuid,
  created_at timestamp with time zone default now() not null,

  check (rep_min <= rep_max),
  check (target_effort_min <= target_effort_max)
);

-- Exercise sets table (individual sets within an exercise)
create table if not exists exercise_sets (
  id uuid default uuid_generate_v4() primary key,
  exercise_id uuid references exercises(id) on delete cascade not null,
  set_number integer not null,
  reps_completed integer,
  effort_percentage integer check (effort_percentage between 0 and 100),
  rpe numeric(3,1) check (rpe between 6 and 10),
  rir integer check (rir between 0 and 3),
  skipped boolean not null default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,

  unique(exercise_id, set_number)
);

-- Weight recommendations table
create table if not exists weight_recommendations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  week_number integer not null,
  exercises jsonb not null default '[]',
  dismissed boolean not null default false,
  created_at timestamp with time zone default now() not null,

  unique(user_id, week_number)
);

-- ============================================================================
-- MIGRATION 002: MULTI-WEEK PROGRAMS
-- ============================================================================

-- Programs table (training phases/cycles)
create table if not exists programs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  total_weeks integer not null default 8 check (total_weeks between 1 and 52),
  current_week integer not null default 1,
  "order" integer not null default 1,
  status text not null default 'active' check (status in ('active', 'completed', 'upcoming')),
  created_at timestamp with time zone default now() not null,

  unique(user_id, "order")
);

-- Week templates table (exercise prescriptions per week)
create table if not exists week_templates (
  id uuid default uuid_generate_v4() primary key,
  program_id uuid references programs(id) on delete cascade not null,
  week_number integer not null check (week_number between 1 and 52),
  created_at timestamp with time zone default now() not null,

  unique(program_id, week_number)
);

-- Exercise templates table (exercise definitions per week per day)
create table if not exists exercise_templates (
  id uuid default uuid_generate_v4() primary key,
  week_template_id uuid references week_templates(id) on delete cascade not null,
  day_number integer not null check (day_number between 1 and 7),
  name text not null,
  "order" integer not null,
  sets integer not null check (sets between 1 and 9),
  weight_kg numeric(5,1) not null check (weight_kg between 0 and 500),
  rep_min integer not null,
  rep_max integer not null,
  target_effort_min integer not null check (target_effort_min between 0 and 100),
  target_effort_max integer not null check (target_effort_max between 0 and 100),
  uses_rpe boolean not null default true,
  uses_rir boolean not null default false,
  target_rpe_min numeric(3,1) check (target_rpe_min between 6 and 10),
  target_rpe_max numeric(3,1) check (target_rpe_max between 6 and 10),
  target_rir_min integer check (target_rir_min between 0 and 3),
  target_rir_max integer check (target_rir_max between 0 and 3),
  is_main_exercise boolean not null default false,
  toughness_rating integer check (toughness_rating between 1 and 5),
  weight_direction text not null default 'increase' check (weight_direction in ('increase', 'decrease')),
  exercise_library_id uuid,
  created_at timestamp with time zone default now() not null,

  check (rep_min <= rep_max),
  check (target_effort_min <= target_effort_max)
);

-- Add program_id to profiles (if not exists)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = 'current_program_id'
  ) then
    alter table profiles add column current_program_id uuid references programs(id);
  end if;
end $$;

-- ============================================================================
-- MIGRATION 003: PHASE 1 CORE UPDATES
-- ============================================================================

-- EXERCISE LIBRARY
create table if not exists exercise_library (
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

-- COACH_ATHLETE TABLE
create table if not exists coach_athlete (
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

-- VIDEO_UPLOADS TABLE
create table if not exists video_uploads (
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

-- NOTIFICATIONS TABLE
create table if not exists notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in ('coach_update', 'video_reviewed', 'weekly_report_submitted', 'athlete_added', 'week_complete')),
  title text not null,
  message text not null,
  metadata jsonb not null default '{}',
  read boolean not null default false,
  created_at timestamp with time zone default now() not null
);

-- USAGE_TRACKING TABLE
create table if not exists usage_tracking (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  usage_type text not null check (usage_type in ('video_upload', 'storage', 'athlete_count')),
  amount bigint not null,
  created_at timestamp with time zone default now() not null
);

-- COACH_USAGE_SUMMARY TABLE
create table if not exists coach_usage_summary (
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

-- WEEKLY_REPORTS TABLE
create table if not exists weekly_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
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
  coach_reviewed_at timestamp with time zone
);

-- ============================================================================
-- ADD MISSING COLUMNS (for tables created from earlier migrations)
-- ============================================================================

do $$
begin
  -- Add template_id to exercises if missing (from migration 002)
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'exercises' and column_name = 'template_id'
  ) then
    alter table exercises add column template_id uuid references exercise_templates(id);
  end if;

  -- Add Phase 1 columns to exercises if missing
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'exercises' and column_name = 'uses_rpe'
  ) then
    alter table exercises add column uses_rpe boolean not null default true;
    alter table exercises add column uses_rir boolean not null default false;
    alter table exercises add column target_rpe_min numeric(3,1) check (target_rpe_min between 6 and 10);
    alter table exercises add column target_rpe_max numeric(3,1) check (target_rpe_max between 6 and 10);
    alter table exercises add column target_rir_min integer check (target_rir_min between 0 and 3);
    alter table exercises add column target_rir_max integer check (target_rir_max between 0 and 3);
    alter table exercises add column is_main_exercise boolean not null default false;
    alter table exercises add column toughness_rating integer check (toughness_rating between 1 and 5);
    alter table exercises add column weight_direction text not null default 'increase' check (weight_direction in ('increase', 'decrease'));
    alter table exercises add column exercise_library_id uuid;
  end if;

  -- Add Phase 1 columns to exercise_sets if missing
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'exercise_sets' and column_name = 'rpe'
  ) then
    alter table exercise_sets add column rpe numeric(3,1) check (rpe between 6 and 10);
    alter table exercise_sets add column rir integer check (rir between 0 and 3);
  end if;

  -- Add Phase 1 columns to workouts if missing
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'workouts' and column_name = 'day_name'
  ) then
    alter table workouts add column day_name text;
    alter table workouts add column skipped_at timestamp with time zone;
  end if;

  -- Add program_id to workouts if missing (from migration 002)
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'workouts' and column_name = 'program_id'
  ) then
    alter table workouts add column program_id uuid;
  end if;

  -- Add program_id to week_templates if missing (should exist from migration 002)
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'week_templates' and column_name = 'program_id'
  ) then
    alter table week_templates add column program_id uuid references programs(id) on delete cascade not null;
  end if;

  -- Add Phase 1 columns to exercise_templates if missing
  if exists (
    select 1 from information_schema.tables where table_name = 'exercise_templates'
  ) and not exists (
    select 1 from information_schema.columns
    where table_name = 'exercise_templates' and column_name = 'uses_rpe'
  ) then
    alter table exercise_templates add column uses_rpe boolean not null default true;
    alter table exercise_templates add column uses_rir boolean not null default false;
    alter table exercise_templates add column target_rpe_min numeric(3,1) check (target_rpe_min between 6 and 10);
    alter table exercise_templates add column target_rpe_max numeric(3,1) check (target_rpe_max between 6 and 10);
    alter table exercise_templates add column target_rir_min integer check (target_rir_min between 0 and 3);
    alter table exercise_templates add column target_rir_max integer check (target_rir_max between 0 and 3);
    alter table exercise_templates add column is_main_exercise boolean not null default false;
    alter table exercise_templates add column toughness_rating integer check (toughness_rating between 1 and 5);
    alter table exercise_templates add column weight_direction text not null default 'increase' check (weight_direction in ('increase', 'decrease'));
    alter table exercise_templates add column exercise_library_id uuid;
  end if;
end $$;

-- ============================================================================
-- CONSTRAINTS
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'exercises_rpe_range') then
    alter table exercises add constraint exercises_rpe_range check (target_rpe_min <= target_rpe_max);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'exercises_rir_range') then
    alter table exercises add constraint exercises_rir_range check (target_rir_min <= target_rir_max);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'exercise_templates_rpe_range') then
    alter table exercise_templates add constraint exercise_templates_rpe_range check (target_rpe_min <= target_rpe_max);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'exercise_templates_rir_range') then
    alter table exercise_templates add constraint exercise_templates_rir_range check (target_rir_min <= target_rir_max);
  end if;
end $$;

-- Note: program_id removed from weekly_reports temporarily
-- Can be added later via separate migration once core schema is stable

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table workouts enable row level security;
alter table exercises enable row level security;
alter table exercise_sets enable row level security;
alter table weight_recommendations enable row level security;
alter table programs enable row level security;
alter table week_templates enable row level security;
alter table exercise_templates enable row level security;
alter table exercise_library enable row level security;
alter table coach_athlete enable row level security;
alter table video_uploads enable row level security;
alter table notifications enable row level security;
alter table usage_tracking enable row level security;
alter table coach_usage_summary enable row level security;
alter table weekly_reports enable row level security;

-- Profiles policies
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Workouts policies
drop policy if exists "Users can view own workouts" on workouts;
drop policy if exists "Users can insert own workouts" on workouts;
drop policy if exists "Users can update own workouts" on workouts;
drop policy if exists "Users can delete own workouts" on workouts;

create policy "Users can view own workouts"
  on workouts for select
  using (auth.uid() = user_id);

create policy "Users can insert own workouts"
  on workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workouts"
  on workouts for update
  using (auth.uid() = user_id);

create policy "Users can delete own workouts"
  on workouts for delete
  using (auth.uid() = user_id);

-- Exercises policies
drop policy if exists "Users can view own exercises" on exercises;
drop policy if exists "Users can insert own exercises" on exercises;
drop policy if exists "Users can update own exercises" on exercises;
drop policy if exists "Users can delete own exercises" on exercises;

create policy "Users can view own exercises"
  on exercises for select
  using (
    exists (
      select 1 from workouts
      where workouts.id = exercises.workout_id
      and workouts.user_id = auth.uid()
    )
  );

create policy "Users can insert own exercises"
  on exercises for insert
  with check (
    exists (
      select 1 from workouts
      where workouts.id = exercises.workout_id
      and workouts.user_id = auth.uid()
    )
  );

create policy "Users can update own exercises"
  on exercises for update
  using (
    exists (
      select 1 from workouts
      where workouts.id = exercises.workout_id
      and workouts.user_id = auth.uid()
    )
  );

create policy "Users can delete own exercises"
  on exercises for delete
  using (
    exists (
      select 1 from workouts
      where workouts.id = exercises.workout_id
      and workouts.user_id = auth.uid()
    )
  );

-- Exercise sets policies
drop policy if exists "Users can view own exercise sets" on exercise_sets;
drop policy if exists "Users can insert own exercise sets" on exercise_sets;
drop policy if exists "Users can update own exercise sets" on exercise_sets;
drop policy if exists "Users can delete own exercise sets" on exercise_sets;

create policy "Users can view own exercise sets"
  on exercise_sets for select
  using (
    exists (
      select 1 from exercises
      join workouts on workouts.id = exercises.workout_id
      where exercises.id = exercise_sets.exercise_id
      and workouts.user_id = auth.uid()
    )
  );

create policy "Users can insert own exercise sets"
  on exercise_sets for insert
  with check (
    exists (
      select 1 from exercises
      join workouts on workouts.id = exercises.workout_id
      where exercises.id = exercise_sets.exercise_id
      and workouts.user_id = auth.uid()
    )
  );

create policy "Users can update own exercise sets"
  on exercise_sets for update
  using (
    exists (
      select 1 from exercises
      join workouts on workouts.id = exercises.workout_id
      where exercises.id = exercise_sets.exercise_id
      and workouts.user_id = auth.uid()
    )
  );

create policy "Users can delete own exercise sets"
  on exercise_sets for delete
  using (
    exists (
      select 1 from exercises
      join workouts on workouts.id = exercises.workout_id
      where exercises.id = exercise_sets.exercise_id
      and workouts.user_id = auth.uid()
    )
  );

-- Weight recommendations policies
drop policy if exists "Users can view own weight recommendations" on weight_recommendations;
drop policy if exists "Users can insert own weight recommendations" on weight_recommendations;
drop policy if exists "Users can update own weight recommendations" on weight_recommendations;

create policy "Users can view own weight recommendations"
  on weight_recommendations for select
  using (auth.uid() = user_id);

create policy "Users can insert own weight recommendations"
  on weight_recommendations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weight recommendations"
  on weight_recommendations for update
  using (auth.uid() = user_id);

-- Programs policies
drop policy if exists "Users can view own programs" on programs;
drop policy if exists "Users can insert own programs" on programs;
drop policy if exists "Users can update own programs" on programs;
drop policy if exists "Users can delete own programs" on programs;

create policy "Users can view own programs"
  on programs for select
  using (auth.uid() = user_id);

create policy "Users can insert own programs"
  on programs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own programs"
  on programs for update
  using (auth.uid() = user_id);

create policy "Users can delete own programs"
  on programs for delete
  using (auth.uid() = user_id);

-- Week templates policies
drop policy if exists "Users can view own week templates" on week_templates;
drop policy if exists "Users can insert own week templates" on week_templates;
drop policy if exists "Users can update own week templates" on week_templates;
drop policy if exists "Users can delete own week templates" on week_templates;

create policy "Users can view own week templates"
  on week_templates for select
  using (
    exists (
      select 1 from programs
      where programs.id = week_templates.program_id
      and programs.user_id = auth.uid()
    )
  );

create policy "Users can insert own week templates"
  on week_templates for insert
  with check (
    exists (
      select 1 from programs
      where programs.id = week_templates.program_id
      and programs.user_id = auth.uid()
    )
  );

create policy "Users can update own week templates"
  on week_templates for update
  using (
    exists (
      select 1 from programs
      where programs.id = week_templates.program_id
      and programs.user_id = auth.uid()
    )
  );

create policy "Users can delete own week templates"
  on week_templates for delete
  using (
    exists (
      select 1 from programs
      where programs.id = week_templates.program_id
      and programs.user_id = auth.uid()
    )
  );

-- Exercise templates policies
drop policy if exists "Users can view own exercise templates" on exercise_templates;
drop policy if exists "Users can insert own exercise templates" on exercise_templates;
drop policy if exists "Users can update own exercise templates" on exercise_templates;
drop policy if exists "Users can delete own exercise templates" on exercise_templates;

create policy "Users can view own exercise templates"
  on exercise_templates for select
  using (
    exists (
      select 1 from week_templates
      join programs on programs.id = week_templates.program_id
      where week_templates.id = exercise_templates.week_template_id
      and programs.user_id = auth.uid()
    )
  );

create policy "Users can insert own exercise templates"
  on exercise_templates for insert
  with check (
    exists (
      select 1 from week_templates
      join programs on programs.id = week_templates.program_id
      where week_templates.id = exercise_templates.week_template_id
      and programs.user_id = auth.uid()
    )
  );

create policy "Users can update own exercise templates"
  on exercise_templates for update
  using (
    exists (
      select 1 from week_templates
      join programs on programs.id = week_templates.program_id
      where week_templates.id = exercise_templates.week_template_id
      and programs.user_id = auth.uid()
    )
  );

create policy "Users can delete own exercise templates"
  on exercise_templates for delete
  using (
    exists (
      select 1 from week_templates
      join programs on programs.id = week_templates.program_id
      where week_templates.id = exercise_templates.week_template_id
      and programs.user_id = auth.uid()
    )
  );

-- Exercise library policies
drop policy if exists "Anyone can view exercise library" on exercise_library;
create policy "Anyone can view exercise library"
  on exercise_library for select
  using (true);

-- Coach-athlete policies
drop policy if exists "Users can view own coaching relationships" on coach_athlete;
drop policy if exists "Users can insert own coaching relationships" on coach_athlete;
drop policy if exists "Users can update own coaching relationships" on coach_athlete;

create policy "Users can view own coaching relationships"
  on coach_athlete for select
  using (auth.uid() = coach_id or auth.uid() = athlete_id);

create policy "Users can insert own coaching relationships"
  on coach_athlete for insert
  with check (auth.uid() = coach_id or auth.uid() = athlete_id);

create policy "Users can update own coaching relationships"
  on coach_athlete for update
  using (auth.uid() = coach_id or auth.uid() = athlete_id);

-- Video uploads policies
drop policy if exists "Users can view own videos" on video_uploads;
drop policy if exists "Coaches can view athlete videos" on video_uploads;
drop policy if exists "Users can insert own videos" on video_uploads;
drop policy if exists "Users can update own videos" on video_uploads;
drop policy if exists "Users can delete own videos" on video_uploads;

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

create policy "Users can update own videos"
  on video_uploads for update
  using (auth.uid() = user_id);

create policy "Users can delete own videos"
  on video_uploads for delete
  using (auth.uid() = user_id);

-- Notifications policies
drop policy if exists "Users can view own notifications" on notifications;
drop policy if exists "Users can insert own notifications" on notifications;
drop policy if exists "Users can update own notifications" on notifications;
drop policy if exists "Users can delete own notifications" on notifications;

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

-- Usage tracking policies
drop policy if exists "Users can view own usage" on usage_tracking;
drop policy if exists "Users can insert own usage" on usage_tracking;

create policy "Users can view own usage"
  on usage_tracking for select
  using (auth.uid() = user_id);

create policy "Users can insert own usage"
  on usage_tracking for insert
  with check (auth.uid() = user_id);

-- Coach usage summary policies
drop policy if exists "Coaches can view own usage summary" on coach_usage_summary;
create policy "Coaches can view own usage summary"
  on coach_usage_summary for select
  using (auth.uid() = coach_id);

-- Weekly reports policies
drop policy if exists "Users can view own reports" on weekly_reports;
drop policy if exists "Users can insert own reports" on weekly_reports;
drop policy if exists "Users can update own reports" on weekly_reports;
drop policy if exists "Coaches can view athlete reports" on weekly_reports;
drop policy if exists "Coaches can update athlete reports" on weekly_reports;

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
-- INDEXES
-- ============================================================================

-- Profiles
create index if not exists idx_profiles_current_program on profiles(current_program_id);

-- Workouts
create index if not exists idx_workouts_user_week on workouts(user_id, week_number);
create index if not exists idx_workouts_program on workouts(program_id);
create index if not exists idx_workouts_day_name on workouts(user_id, week_number, day_name);

-- Exercises
create index if not exists idx_exercises_workout on exercises(workout_id);
create index if not exists idx_exercises_order on exercises(workout_id, "order");
create index if not exists idx_exercises_uses_rpe on exercises(workout_id) where uses_rpe = true;
create index if not exists idx_exercises_uses_rir on exercises(workout_id) where uses_rir = true;
create index if not exists idx_exercises_main on exercises(workout_id) where is_main_exercise = true;
create index if not exists idx_exercises_toughness on exercises(workout_id, toughness_rating);
create index if not exists idx_exercises_library on exercises(exercise_library_id);
create index if not exists idx_exercises_template on exercises(template_id);

-- Exercise sets
create index if not exists idx_exercise_sets_exercise on exercise_sets(exercise_id);

-- Weight recommendations
create index if not exists idx_weight_recommendations_user on weight_recommendations(user_id);

-- Programs
create index if not exists idx_programs_user on programs(user_id);
create index if not exists idx_programs_user_status on programs(user_id, status);

-- Week templates
create index if not exists idx_week_templates_program on week_templates(program_id);

-- Exercise templates
create index if not exists idx_exercise_templates_week on exercise_templates(week_template_id);
create index if not exists idx_exercise_templates_week_day on exercise_templates(week_template_id, day_number);
create index if not exists idx_exercise_templates_library on exercise_templates(exercise_library_id);

-- Exercise library
create index if not exists idx_exercise_library_name on exercise_library using gin(to_tsvector('english', name));
create index if not exists idx_exercise_library_aliases on exercise_library using gin(aliases);
create index if not exists idx_exercise_library_category on exercise_library(category);
create index if not exists idx_exercise_library_movement on exercise_library(movement_type);
create index if not exists idx_exercise_library_equipment on exercise_library(equipment);
create index if not exists idx_exercise_library_base on exercise_library(base_exercise_id);

-- Coach-athlete
create index if not exists idx_coach_athlete_coach on coach_athlete(coach_id, status);
create index if not exists idx_coach_athlete_athlete on coach_athlete(athlete_id, status);

-- Video uploads
create index if not exists idx_video_uploads_user on video_uploads(user_id);
create index if not exists idx_video_uploads_exercise on video_uploads(exercise_id);
create index if not exists idx_video_uploads_coach on video_uploads(coach_id);
create index if not exists idx_video_uploads_auto_delete on video_uploads(auto_delete_at) where coach_reviewed = false;

-- Notifications
create index if not exists idx_notifications_user_unread on notifications(user_id, read, created_at desc);
create index if not exists idx_notifications_user_type on notifications(user_id, type, created_at desc);

-- Usage tracking
create index if not exists idx_usage_tracking_user_type on usage_tracking(user_id, usage_type, created_at);
create index if not exists idx_usage_tracking_period on usage_tracking(created_at);

-- Coach usage summary
create index if not exists idx_coach_usage_summary_coach on coach_usage_summary(coach_id, period_end desc);

-- Weekly reports
create index if not exists idx_weekly_reports_user on weekly_reports(user_id, week_number desc);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
