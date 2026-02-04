-- Multi-Week Program Support Migration

-- Programs table (training phases/cycles)
create table programs (
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
create table week_templates (
  id uuid default uuid_generate_v4() primary key,
  program_id uuid references programs(id) on delete cascade not null,
  week_number integer not null check (week_number between 1 and 52),
  created_at timestamp with time zone default now() not null,

  unique(program_id, week_number)
);

-- Exercise templates table (exercise definitions per week per day)
create table exercise_templates (
  id uuid default uuid_generate_v4() primary key,
  week_template_id uuid references week_templates(id) on delete cascade not null,
  day_number integer not null check (day_number between 1 and 7),
  name text not null,
  "order" integer not null,
  sets integer not null check (sets between 1 and 9),
  weight_kg decimal(5,2) not null check (weight_kg between 0 and 500),
  rep_min integer not null,
  rep_max integer not null,
  target_effort_min integer not null check (target_effort_min between 0 and 100),
  target_effort_max integer not null check (target_effort_max between 0 and 100),
  created_at timestamp with time zone default now() not null,

  check (rep_min <= rep_max),
  check (target_effort_min <= target_effort_max)
);

-- Add current_program_id to profiles
alter table profiles add column current_program_id uuid references programs(id);

-- Add program_id to workouts
alter table workouts add column program_id uuid references programs(id);

-- Relax day_number constraint on workouts to allow up to 7 days
alter table workouts drop constraint workouts_day_number_check;
alter table workouts add constraint workouts_day_number_check check (day_number between 1 and 7);

-- Add template_id to exercises (optional link back to template)
alter table exercises add column template_id uuid references exercise_templates(id);

-- Indexes for new tables
create index idx_programs_user on programs(user_id);
create index idx_programs_user_status on programs(user_id, status);
create index idx_week_templates_program on week_templates(program_id);
create index idx_exercise_templates_week on exercise_templates(week_template_id);
create index idx_exercise_templates_week_day on exercise_templates(week_template_id, day_number);
create index idx_workouts_program on workouts(program_id);

-- RLS for programs
alter table programs enable row level security;

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

-- RLS for week_templates (via program ownership)
alter table week_templates enable row level security;

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

-- RLS for exercise_templates (via program ownership chain)
alter table exercise_templates enable row level security;

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
