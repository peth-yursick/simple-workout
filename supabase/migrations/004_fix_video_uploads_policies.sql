-- Fix: Update video_uploads policies to properly reference coach_athlete table
-- Run this after migration 003_phase1_core_updates.sql has been applied

-- First, drop the problematic policy
drop policy if exists "Coaches can view athlete videos" on video_uploads;

-- Recreate it with proper check (coach_athlete table should exist now)
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
