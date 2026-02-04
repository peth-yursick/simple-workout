-- Simple Workout Database Schema

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  current_week integer not null default 1,
  current_level integer not null default 1,
  level_progress decimal(5,2) not null default 0,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Workouts table (3 days per week)
create table workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  week_number integer not null,
  day_number integer not null check (day_number between 1 and 3),
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,

  unique(user_id, week_number, day_number)
);

-- Exercises table
create table exercises (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references workouts(id) on delete cascade not null,
  name text not null,
  "order" integer not null,
  sets integer not null check (sets between 1 and 9),
  weight_kg decimal(5,2) not null check (weight_kg between 0 and 500),
  rep_min integer not null,
  rep_max integer not null,
  target_effort_min integer not null check (target_effort_min between 0 and 100),
  target_effort_max integer not null check (target_effort_max between 0 and 100),
  status text not null default 'incomplete' check (status in ('incomplete', 'complete', 'skipped')),
  created_at timestamp with time zone default now() not null,

  check (rep_min <= rep_max),
  check (target_effort_min <= target_effort_max)
);

-- Exercise sets table (individual sets within an exercise)
create table exercise_sets (
  id uuid default uuid_generate_v4() primary key,
  exercise_id uuid references exercises(id) on delete cascade not null,
  set_number integer not null,
  reps_completed integer,
  effort_percentage integer check (effort_percentage between 0 and 100),
  skipped boolean not null default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,

  unique(exercise_id, set_number)
);

-- Weight recommendations table
create table weight_recommendations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  week_number integer not null,
  exercises jsonb not null default '[]',
  dismissed boolean not null default false,
  created_at timestamp with time zone default now() not null,

  unique(user_id, week_number)
);

-- Indexes for common queries
create index idx_workouts_user_week on workouts(user_id, week_number);
create index idx_exercises_workout on exercises(workout_id);
create index idx_exercises_order on exercises(workout_id, "order");
create index idx_exercise_sets_exercise on exercise_sets(exercise_id);
create index idx_weight_recommendations_user on weight_recommendations(user_id);

-- Row Level Security (RLS)
alter table profiles enable row level security;
alter table workouts enable row level security;
alter table exercises enable row level security;
alter table exercise_sets enable row level security;
alter table weight_recommendations enable row level security;

-- RLS Policies: Users can only access their own data
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

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

create policy "Users can view own weight recommendations"
  on weight_recommendations for select
  using (auth.uid() = user_id);

create policy "Users can insert own weight recommendations"
  on weight_recommendations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weight recommendations"
  on weight_recommendations for update
  using (auth.uid() = user_id);

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
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
